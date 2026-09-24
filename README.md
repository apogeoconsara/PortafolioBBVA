# Behavioral AI Studio — Demo (BBVA / Behavioral AI Lead)

> Pieza de portafolio construida para una entrevista de **Behavioral AI Lead** en BBVA —
> un rol que integra economía del comportamiento, inteligencia artificial y ciencia de
> datos para escalar capacidades analíticas y producir soluciones reutilizables dentro de
> un banco. Este repositorio es independiente de cualquier otro proyecto de portafolio del
> autor (por ejemplo `GTM AI Outbound Engine`, en un repo aparte): no comparte código,
> dependencias, dataset ni infraestructura con ningún otro.

## Disclaimer (leer primero)

**Todo el dato de esta demo es 100% sintético y ficticio.** Los 18 "clientes", sus nombres,
edades, historiales de transacciones y señales de comportamiento fueron inventados para
este ejercicio de portafolio — ninguno corresponde a una persona real, a un cliente real de
BBVA ni a ningún otro banco. Los nombres de producto usados ("tarjeta de crédito", "ahorro
programado", "redondeo", "pago mínimo") son genéricos de cualquier banco minorista, no
nombres comerciales reales de BBVA. Las reglas de segmentación, los pesos, los umbrales y
el catálogo de iniciativas son ilustrativos y fueron diseñados por el autor para esta
demo — **no reflejan ninguna metodología interna real de BBVA**, y esto **no es un proyecto
activo de BBVA** ni de ningún banco: es material de investigación/demo para una entrevista.

## Qué es este proyecto

Un motor de segmentación conductual **determinístico** (pura lógica JS, fórmulas
documentadas, cero dependencia de IA) que:

1. Parte de una **biblioteca de 15 constructos de ciencias del comportamiento** relevantes
   para banca minorista (aversión a la pérdida, sesgo del presente, efecto del default,
   anclaje, contabilidad mental, sesgo de saliencia, efecto de gradiente de meta, etc.),
   cada uno con su procedencia académica ampliamente establecida (Kahneman & Tversky,
   Thaler, Cialdini, Cialdini, Iyengar & Lepper...), su proxy medible en datos de
   transacciones, y un patrón de nudge reutilizable.
2. Deriva de 3 a 5 **señales de comportamiento** por cliente sintético a partir de un
   historial de transacciones fabricado (racha de pagos mínimos, sobregiros, metas de
   ahorro dormidas, crecimiento de suscripciones, gasto concentrado post-nómina, etc.),
   con fórmulas visibles y auditables en el propio código.
3. Asigna un **segmento + nudge + prioridad** mediante 7 reglas en cascada, mostrando
   siempre la regla exacta que se activó — nada de caja negra.
4. Opcionalmente llama a **Claude (Anthropic)** para redactar un mensaje de nudge
   personalizado para un solo cliente sintético a la vez, marcando cada afirmación como
   `FACT` (observada directamente en los datos) o `INFERENCE` (hipótesis), con un
   auto-chequeo de "dark pattern" incluido en la propia respuesta del modelo.
5. Incluye un **panel de responsabilidad de IA** con una rúbrica real de sesgo,
   explicabilidad y riesgo de patrón oscuro — incluyendo ejemplos hipotéticos de
   anti-patrones para demostrar que la rúbrica sí distingue un nudge sano de uno abusivo.
6. Prioriza un **portafolio de 9 iniciativas** ilustrativas por impacto, complejidad y
   alineación estratégica, con pesos editables en vivo y un mapa 2x2.
7. Ofrece una herramienta de **autoservicio** (sin IA, ensamblado de plantillas puro) para
   que alguien sin conocimientos de ciencia de datos arme un borrador de nudge eligiendo un
   objetivo de negocio, un segmento y un constructo — la prueba de que esto puede escalar
   sin depender de un especialista como cuello de botella.

Corre 100% client-side en un único `public/index.html`, sin backend obligatorio, desplegado
en Netlify.

## Cómo mapea cada pieza a la vacante

| Pieza de esta demo | Responsabilidad exacta de la vacante que demuestra |
|---|---|
| 1. Biblioteca de sesgos | "Transformar metodologías y aprendizajes de comportamiento en herramientas, frameworks y activos escalables y reutilizables." |
| 2-3. Dataset sintético + motor de segmentación | "Integrar las ciencias del comportamiento con Data Science, traduciendo constructos de comportamiento en variables, modelos y sistemas analíticos." |
| 4. Panel de razonamiento de IA en vivo | "Entendimiento de arquitectura de IA/LLMs" — aplicado con salvaguardas reales (gate de clientes fijos, costo/latencia visibles, credencial nunca expuesta). |
| 5. Responsabilidad de IA | "Definir criterios para evaluar soluciones de IA desde una perspectiva conductual, considerando mitigación de sesgos, explicabilidad y riesgos." |
| 6. Portafolio de iniciativas | "Gestionar y priorizar el portfolio de iniciativas de Behavioral AI según impacto estratégico, complejidad y alineación con el banco." |
| 7. Autoservicio | "Liderar la formación, creación de herramientas accesibles y transferencia de conocimiento para fomentar la autonomía de equipos no expertos." |
| Toda la app como un solo sistema conectado | "Actuar como puente estratégico entre las necesidades de negocio, la comprensión del comportamiento y la ejecución tecnológica." |

## Los 18 clientes sintéticos (distribución real de esta pasada)

El motor, con los umbrales por default, produce: **6 de prioridad Alta** (3 en "Deuda
revolvente crónica", 3 en "Riesgo de sobregiro recurrente"), **8 de prioridad Media** (3 en
"Meta de ahorro abandonada", 2 en "Gasto en suscripciones creciente", 3 en "Cerca de la
meta"), y **4 de prioridad Baja** (2 en "Sin hábito de ahorro automático", 2 en
"Comportamiento financiero estable"). No es un reparto perfecto 6/6/6 — el dataset se
diseñó para que cada una de las 7 reglas tuviera al menos un caso real, no para forzar una
distribución pareja. Desde **Configuración** se pueden ajustar los umbrales de cada regla en
vivo y ver cómo cambia la distribución al instante.

## Arquitectura: prototipo actual vs. diseño de producción

**Lo que corre de verdad hoy (prototipo funcional):**
- El motor de señales y el motor de segmentación: JS puro, determinístico, sin llamada de
  red, funciona sin ninguna configuración.
- El panel de razonamiento de IA en vivo: llamada real a la API de Anthropic
  (`claude-haiku-4-5`) vía una Netlify Function, con tokens/latencia/costo reales.
- El panel de Configuración: los umbrales y pesos son estado real en memoria del navegador,
  editable en vivo, y todas las tablas se recalculan al cambiarlos.
- El panel de Autoservicio: ensamblado de texto por plantillas, determinístico, sin IA.

**Lo que aquí es diseño, no una implementación real (cómo se conectaría en un banco real):**
- **Fuente de datos**: en producción, las métricas de comportamiento (racha de pago mínimo,
  sobregiros, dormancia de metas, etc.) vendrían de un pipeline de features sobre el data
  warehouse del banco (Snowflake/BigQuery + un feature store), no de un arreglo JS
  hardcodeado. El propio código de `computeSignals()` ya está escrito como si recibiera esas
  métricas ya calculadas — sería el mismo cálculo, con otra fuente.
- **Plataforma de experimentación**: en producción, cada nudge debería salir por una
  plataforma de A/B testing real (con grupo de control) antes de escalarse, y el "impacto"
  del portafolio de iniciativas debería alimentarse de resultados medidos, no de un puntaje
  ilustrativo puesto a mano.
- **Persistencia y gobernanza**: la biblioteca de sesgos y la rúbrica de responsabilidad de
  IA deberían vivir en un repositorio versionado con revisión de un comité (legal,
  cumplimiento, ciencia de datos), no en un archivo HTML de demo.
- **Integración con el equipo no experto**: el panel de Autoservicio es una simulación de
  cómo un equipo de negocio auto-atendería una plantilla de nudge; en producción esto sería
  una herramienta interna conectada al catálogo real de segmentos vivos del banco, con
  permisos y un flujo de aprobación antes de cualquier envío.
- **El gate de aprobación humana**: esta demo no envía nada a nadie — ni el nudge
  determinístico ni el redactado por Claude se disparan automáticamente. En producción, todo
  nudge necesitaría pasar por el mismo tipo de checklist del panel de Responsabilidad de IA
  como una puerta de aprobación real antes de salir a producción, no solo como una tabla
  informativa.

## Principio de diseño: la IA no decide, solo redacta

**El segmento, la prioridad y el nudge asignado son y seguirán siendo determinísticos** —
el criterio es que una decisión que afecta el dinero de un cliente debe poder explicarse con
una regla en una frase, no con la salida de un modelo. La IA (Claude, vía Anthropic) se usa
únicamente donde el razonamiento no estructurado agrega valor real: redactar una versión más
personalizada y humana del mismo nudge ya decidido, marcando explícitamente qué es hecho
observado y qué es hipótesis. Nada de esto envía nada por sí solo.

## Estructura

```
/public/index.html                        → app completa (HTML + CSS + JS), un solo archivo
/netlify/functions/behavioral-reasoning.mjs → llamada real a Anthropic (Claude) para el paso de razonamiento
/netlify.toml                             → configuración de deploy en Netlify
```

## Cómo correrlo

Es un HTML estático sin build step — se puede abrir `public/index.html` directamente en un
navegador (el motor determinístico funciona completo sin ninguna configuración), o
desplegar `public/` como publish directory en Netlify (o cualquier host estático) usando
este `netlify.toml`.

## Modo Claude en vivo (opcional)

Desde el detalle de cualquier cliente sintético hay un botón "Ejecutar razonamiento de IA en
vivo (Claude)" que llama a `/.netlify/functions/behavioral-reasoning`, una Netlify Function
que sostiene la `ANTHROPIC_API_KEY` del dueño del sitio del lado del servidor y hace una
llamada real a `claude-haiku-4-5` para redactar, solo para ese cliente y esa sesión de
navegador, una versión personalizada del nudge ya decidido por el motor determinístico. El
visitante no necesita pegar ninguna credencial propia — la función solo acepta los 18
`customer_id` que ya están en el dataset público de esta demo, para no convertirse en un
proxy abierto de prompts arbitrarios. La respuesta incluye tokens reales, latencia y costo
estimado, que se muestran directamente en el panel.

**Para activarlo**, agrega `ANTHROPIC_API_KEY` (una API key de Anthropic) en el dashboard de
Netlify de este sitio (Site configuration → Environment variables). Si no está configurada,
el botón sigue mostrando el nudge determinístico (que siempre funciona) y explica en el
propio panel por qué la llamada en vivo falló, en vez de romperse silenciosamente.

## Disclaimer final

Proyecto de portafolio construido en 2026-09-24 para un proceso de entrevista de Behavioral
AI Lead en BBVA. Los 18 clientes, sus historiales de transacciones y las señales derivadas
son 100% sintéticos e inventados por el autor con fines ilustrativos — no existen en ningún
sistema real. Las reglas de segmentación, los pesos del portafolio de iniciativas y la
biblioteca de sesgos fueron diseñados por el autor para esta demo, con procedencia académica
verificable en cada constructo, pero **no representan la metodología interna real de BBVA**.
Esto no es una campaña activa ni un sistema en producción — es material de investigación de
candidato para efectos de entrevista.
