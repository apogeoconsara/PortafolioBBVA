// Netlify Function — real Anthropic (Claude) call for the "Live AI reasoning"
// panel of the Behavioral AI Studio demo.
//
// Why this exists: the client-side demo computes behavioral signals and a
// segment/nudge assignment deterministically (pure JS, documented formulas,
// zero setup, zero cost). That deterministic engine is what actually decides
// the segment and priority tier — it never changes here. This function adds
// an optional, clearly-labeled extra step: asking a real Claude model to
// draft a personalized nudge message for ONE synthetic customer, grounded
// only in the behavioral signals the deterministic engine already computed,
// with every claim in the draft explicitly marked FACT (directly observed in
// the synthetic transaction data) or INFERENCE (a hypothesis about why).
//
// Credentials: ANTHROPIC_API_KEY lives only as a Netlify environment
// variable on the site owner's account — never in this repo, never sent to
// the browser, never pasted by a visitor.
//
// Safety gate: this endpoint is read-only (it never writes anywhere), but it
// still spends real API budget and could otherwise be used as an open prompt
// proxy. So it only accepts the fixed set of synthetic customer IDs that
// already exist in the demo's own dataset (customer.json baked into
// public/index.html) — never arbitrary customer data from the request body
// beyond what is needed to draft the message, and never free-text prompts.
const KNOWN_CUSTOMER_IDS = new Set([
  "cs_01", "cs_02", "cs_03", "cs_04", "cs_05", "cs_06", "cs_07", "cs_08",
  "cs_09", "cs_10", "cs_11", "cs_12", "cs_13", "cs_14", "cs_15", "cs_16",
  "cs_17", "cs_18"
]);

// Published Anthropic pricing for claude-haiku-4-5 as of this writing — used
// only to show an estimated cost per call in the UI, never billed from here.
const PRICE_PER_1M_INPUT_TOKENS = 1.0;
const PRICE_PER_1M_OUTPUT_TOKENS = 5.0;
const MODEL = "claude-haiku-4-5";

const SYSTEM_PROMPT = `You are a behavioral-science assistant helping draft a personalized nudge message for ONE customer of a retail bank, based ONLY on synthetic (fictitious) behavioral signals already computed by a deterministic rules engine. You never invent facts, transactions, balances, or life events that are not present in the input. Return ONLY valid JSON matching this schema, no prose outside the JSON:
{
  "segment_summary": string (one sentence, plain language, naming the behavioral pattern this customer shows),
  "primary_construct": string (the behavioral-science construct that best explains the pattern, e.g. "Present bias (descuento hiperbólico)"),
  "claims": [
    { "type": "FACT" | "INFERENCE", "text": string }
  ] (3-6 items; FACT = directly computed from the signals/metrics given to you; INFERENCE = a plausible hypothesis about cause or motivation that is NOT directly observed — label honestly, do not dress up an inference as a fact),
  "nudge_message": {
    "channel": "notificación push" | "correo" | "mensaje in-app",
    "subject_or_title": string (short, specific, no fear-mongering, no dark patterns — this must help the customer, never pressure them toward a product that benefits the bank at their expense),
    "body": string (60-120 words, in Spanish, warm but professional, references the actual behavioral pattern honestly without being clinical or shaming, ends with one small concrete low-friction action the customer can take),
    "cta_label": string (short button/link label for the one concrete action)
  },
  "dark_pattern_self_check": string (one honest sentence: does this nudge push the customer toward MORE savings / less debt / their own stated goal (pro-customer), or toward a bank-revenue product (potential conflict of interest)? Say which, plainly),
  "confidence": "alta" | "media" | "baja"
}
Never invent a customer name detail, account balance, or transaction not given to you. All customer data provided to you is 100% synthetic/fictitious — treat it as such, never imply it is a real person. Write nudge_message content in Spanish (Mexico). Never use dark patterns yourself in the message you draft: no artificial urgency, no shame, no hidden costs, no pre-selected costly options. Respond with ONLY the raw JSON object described above — no markdown code fences, no prose before or after it.`;

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured on this site" }), { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const customer = body.customer || {};
  if (!KNOWN_CUSTOMER_IDS.has(customer.id)) {
    return new Response(JSON.stringify({ error: "Unknown customer_id — this endpoint only serves the demo's own synthetic dataset" }), { status: 400 });
  }

  const userPayload = JSON.stringify({
    customer_id: customer.id,
    customer_first_name_fictitious: typeof customer.first_name === "string" ? customer.first_name.slice(0, 40) : null,
    segment: body.segment,
    priority_tier: body.priority_tier,
    signals: Array.isArray(body.signals) ? body.signals : [],
    fired_rule: body.fired_rule || null,
    raw_metrics: body.raw_metrics || {}
  });

  const startedAt = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPayload }]
    })
  });
  const latencyMs = Date.now() - startedAt;

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return new Response(JSON.stringify({ error: `Anthropic API error ${res.status}: ${errText.slice(0, 300)}` }), { status: 502 });
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "Claude response was not valid JSON" }), { status: 502 });
  }

  const usage = data.usage || {};
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const estimatedCostUsd =
    (inputTokens / 1_000_000) * PRICE_PER_1M_INPUT_TOKENS +
    (outputTokens / 1_000_000) * PRICE_PER_1M_OUTPUT_TOKENS;

  return new Response(JSON.stringify({
    reasoning: { ...parsed, source: "live_anthropic" },
    meta: {
      model: MODEL,
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
      latency_ms: latencyMs,
      estimated_cost_usd: Number(estimatedCostUsd.toFixed(6))
    }
  }), { headers: { "content-type": "application/json" } });
};
