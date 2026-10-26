# Auditoría de rendimiento

Resumen del proceso: medir → analizar → corregir → volver a medir.
Las mediciones deben hacerse sobre el build de producción (build + start), en modo escritorio.

## Índice
- website
   - Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`): línea base recibida.
- talent-pipeline-tracker
   - Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3001.app.github.dev/`): línea base recibida.
- administrar_incidentes
   - Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`): línea base recibida.
- suppliers_tinydb
   - Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`): línea base recibida.
- analizador_incidentes
   - Incidencias (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/incidents`): línea base recibida.
- administrar_inventario
   - Productos (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/backoffice/inventory/products`): línea base recibida.

---

## website — Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`)

### 1. Condiciones de la medición
- Modo: escritorio, según el alcance de esta auditoría.
- Acceso: página pública; no requiere inicio de sesión (confirmado por el usuario).
- Backend y volumen de datos: no aplican a esta vista.
- Ejecución: build de producción servido con `next start` (confirmado por el usuario).
- URL medida: host de preview de GitHub Codespaces indicado arriba.
- El usuario repitió la medición en incógnito y los resultados no cambiaron.
- Lighthouse avisa que IndexedDB almacenado podría afectar la carga; recomienda repetir en una ventana de incógnito.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 100 |
| Accessibility | 92 |
| Best Practices | 100 |
| SEO | 66 |

Métricas clave: TTFB no visible; FCP 0,5 s; LCP 0,5 s; CLS 0; TBT 0 ms; INP no disponible; Speed Index 0,9 s.

Captura: ![Lighthouse antes](./before/website-home-before.png)

### 3. Problemas identificados

1. **Problema:** TTFB no aparece en las capturas.
   - **Métrica afectada:** TTFB.
   - **Causa raíz:** no determinable con los datos recibidos; no se atribuye a servidor, caché o red sin la medición.
   - **Corrección propuesta:** aportar el valor de TTFB o el JSON de Lighthouse antes de evaluar una corrección.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** pendiente de datos.

2. **Problema:** «Improve image delivery», con ahorro estimado de 259 KiB.
   - **Métrica afectada:** transferencia de imágenes y, potencialmente, LCP; el LCP medido ya es 0,5 s.
   - **Causa raíz:** la página usa `next/image` para el hero y prioriza su carga; el archivo fuente `public/images/brasaland-hero.jpg` ocupa aproximadamente 1,2 MiB. La captura no muestra qué recurso concreto genera el ahorro ni el formato/tamaño efectivamente transferido, por lo que no se confirma que sea el recurso señalado. Véase [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L156) y [el recurso del hero](../uis/website/public/images/brasaland-hero.jpg).
   - **Corrección propuesta:** revisar el detalle expandido de «Improve image delivery» o el JSON. Si identifica el hero, evaluar reducir/recomprimir el archivo fuente sin cambiar `priority` ni degradar la imagen; Next.js ya tiene habilitada la optimización de imágenes por defecto.
   - **Origen de la recomendación:** skill `performance` (optimizar imágenes y priorizar el recurso LCP) y análisis propio.
   - **Estado:** propuesta condicionada a identificar el recurso.

3. **Problema:** el desglose muestra LCP de 0,5 s y CLS de 0.
   - **Métrica afectada:** LCP y CLS.
   - **Causa raíz:** no se observa un fallo medido. El hero tiene `priority`, `sizes="100vw"` y dimensiones de layout mediante `fill`; no hay evidencia para cambiar esa estrategia. Véase [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L156).
   - **Corrección propuesta:** ninguna por ahora; conservar la prioridad del hero y evitar preloads adicionales sin evidencia de una cadena crítica.
   - **Origen de la recomendación:** skill `performance`.
   - **Estado:** sin cambio propuesto.

4. **Problema:** aparece una tarea larga en diagnósticos y «Legacy JavaScript» estima 13 KiB; a la vez, TBT es 0 ms y la puntuación Performance es 100.
   - **Métrica afectada:** diagnóstico de JavaScript/posible responsividad; INP no está disponible.
   - **Causa raíz:** la captura no expande la tarea ni identifica módulos. La página principal es un Server Component; `SiteHeader` y `FadeIn` son límites cliente visibles en el código, pero no se demuestra que causen una regresión. No se debe tratar TBT como si fuera INP.
   - **Corrección propuesta:** ninguna hasta recibir el detalle de la tarea y confirmar que la medición corresponde al build de producción. No reducir ni diferir JavaScript necesario para la interacción.
   - **Origen de la recomendación:** skill `performance` (usar TBT como diagnóstico de laboratorio y cambiar únicamente código ligado a un cuello de botella medido).
   - **Estado:** pendiente de evidencia; no se propone cambio de código.

5. **Problema:** «Render-blocking requests», «Minify JavaScript» (73 KiB) y «Reduce unused JavaScript» (138 KiB).
   - **Métrica afectada:** carga y transferencia de recursos.
   - **Causa raíz:** las capturas no muestran las solicitudes ni los módulos implicados. El layout usa `next/font/google`, que descarga las fuentes durante el build y las sirve desde la propia aplicación; no hay evidencia aquí de una fuente externa bloqueante. Véase [layout.tsx](../uis/website/app/layout.tsx#L2).
   - **Corrección propuesta:** revisar las filas expandidas/JSON y confirmar el modo de ejecución antes de modificar carga de recursos o configuración. No se propone eliminar funcionalidades ni cambiar la configuración de build a partir de los ahorros estimados por sí solos.
   - **Origen de la recomendación:** skill `performance` y análisis propio.
   - **Estado:** pendiente de detalles.

6. **Problema:** Lighthouse señala «Elements use prohibited ARIA attributes» en cuatro contenedores de calificación.
   - **Métrica afectada:** Accessibility (92).
   - **Causa raíz:** `StarRating` asignaba `aria-label` a un `<div>` genérico que no admitía ese nombre accesible sin un rol compatible. Los SVG internos ya eran decorativos (`aria-hidden`). Véase [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L125).
   - **Corrección propuesta:** dar al contenedor un rol semántico apropiado, por ejemplo `img`, manteniendo el nombre accesible y los SVG decorativos.
   - **Origen de la recomendación:** análisis propio a partir del elemento fallido mostrado por Lighthouse.
   - **Estado:** aplicada en [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L125).

7. **Problema:** SEO es 66; Lighthouse informa que la página está bloqueada para indexación por `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** SEO e indexación/crawlabilidad.
   - **Causa raíz:** los metadatos de la portada declaran `robots.index: true`, `follow: true` y canonical `/`, y no se encontró una regla de `X-Robots-Tag`/`noindex` en el código del sitio. El header observado corresponde a la URL de preview `app.github.dev`; apunta al entorno que sirve el puerto, no a los metadatos de Next.js. Una petición desde este contenedor recibió `401` de autenticación del túnel, por lo que no fue posible inspeccionar más headers de respuesta. Véase [app/page.tsx](../uis/website/app/page.tsx#L22).
   - **Corrección propuesta:** no añadir otro header en la aplicación: no eliminaría con fiabilidad el header externo y podría producir directivas contradictorias. Para mejorar el SEO público, medir la URL canónica de producción (`https://brasaland.com/`) y, si allí también se envía `noindex`, retirar la directiva en el servidor/CDN que la añade.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** pendiente; no corregible desde el código disponible del sitio. Confirmar en el host público.

### 4. Análisis de refactorización

1. **Dónde aparece:** [SiteHeader.tsx](../uis/website/components/SiteHeader.tsx#L92) y [SiteHeader.tsx](../uis/website/components/SiteHeader.tsx#L129) recorren los mismos `navItems` para las variantes de escritorio y móvil.
   - **Por qué es candidato:** la estructura y semántica de enlaces se mantienen en dos bloques paralelos, con riesgo de que cambien de forma distinta.
   - **Abstracción compartida propuesta:** `SiteNavigationLinks`, en [SiteNavigationLinks.tsx](../uis/website/components/SiteNavigationLinks.tsx), con `items`, variante visual y callback opcional; conserva roles, `aria-current`, claves y cierre del menú móvil. Integrada desde [SiteHeader.tsx](../uis/website/components/SiteHeader.tsx).
   - **Estado:** aplicada; refactor de mantenibilidad, sin mejora Lighthouse atribuible por sí sola.

2. **Dónde aparece:** CTA a `/brasa-points` en [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L176) y [HomePage.tsx](../uis/website/components/home/HomePage.tsx#L341).
   - **Por qué es candidato:** repite destino, intención y estilos de acción de marca, aunque cambia el texto, el icono y el énfasis visual.
   - **Abstracción compartida propuesta:** `BrasaPointsCTA`, en [BrasaPointsCTA.tsx](../uis/website/components/home/BrasaPointsCTA.tsx), con variante visual y nombre accesible como props; integrada en [HomePage.tsx](../uis/website/components/home/HomePage.tsx).
   - **Estado:** aplicada; refactor de mantenibilidad, sin mejora Lighthouse atribuible por sí sola.

### 5. Evidencia de uso de la skill
- La skill recomienda identificar el recurso LCP y darle prioridad, además de no añadir preloads sin evidencia. El hero ya usa `next/image`, `priority` y `sizes="100vw"`; se conserva esa configuración.
- La skill recomienda optimizar imágenes según el recurso transferido; la captura estima 259 KiB de ahorro y el archivo fuente del hero pesa aproximadamente 1,2 MiB. La relación debe confirmarse con el detalle del diagnóstico antes de cambiar el archivo.
- La skill distingue TBT de INP y pide cambios ligados a cuellos de botella medidos. TBT es 0 ms, no hay valor de INP y la captura no identifica la tarea larga; no se propone reducir JavaScript por el diagnóstico aislado.
- La skill recomienda cargar fuentes de forma eficiente; el sitio usa `next/font/google`, que las sirve localmente tras el build. No se propone añadir enlaces externos ni preloads especulativos.

### 6. Validación de las correcciones
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto; Next.js informa que detectó dos `package-lock.json` y eligió el de la raíz como workspace root.
- ESLint de `BrasaPointsCTA.tsx`, `SiteHeader.tsx` y `SiteNavigationLinks.tsx`: correcto.
- ESLint de `HomePage.tsx`: quedan dos errores `react/no-unescaped-entities` en las comillas del texto de reseña, ajenos al cambio de accesibilidad/refactor.
- La app no define un script de pruebas en `package.json`.

---

## talent-pipeline-tracker — Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3001.app.github.dev/`)

### 1. Condiciones de la medición
- Modo: escritorio.
- Ejecución: build de producción servido con `next start -p 3001` (confirmado por el usuario).
- Acceso: no requiere login; consume una API pública.
- Volumen: la captura muestra 20 candidaturas y 77 notas; no se confirmó si estos valores representan todo el conjunto devuelto por la API.
- Captura recibida en `audit/before/talentpipelinetracker-home-before.png`. Para seguir la convención de nombre del informe, usar `talent-pipeline-tracker-home-before.png` en la siguiente captura de esta página.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 96 |
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 60 |

Métricas clave: TTFB no visible; FCP 0,4 s; LCP 0,6 s; CLS 0,115; TBT 0 ms; INP no disponible; Speed Index 0,8 s.

Captura: ![Lighthouse antes](./before/talentpipelinetracker-home-before.png)

### 3. Problemas identificados

1. **Problema:** TTFB no aparece como métrica independiente. La cadena de dependencias marca 344 ms para la navegación inicial y una latencia crítica máxima de 596 ms hasta el CSS.
   - **Métrica afectada:** TTFB y ruta crítica de carga.
   - **Causa raíz:** Lighthouse no proporciona TTFB. La cadena continúa con un CSS de 7,23 KiB; no es posible atribuir el tiempo del documento a código de la app con esta evidencia.
   - **Corrección propuesta:** ninguna hasta disponer de TTFB/JSON o de una traza que identifique el tiempo de respuesta del documento.
   - **Origen de la recomendación:** análisis propio; skill `performance` recomienda priorizar la ruta crítica medida y evitar preloads especulativos.
   - **Estado:** pendiente de datos.

2. **Problema:** LCP es 0,6 s; el insight muestra una cadena crítica sin ahorro cuantificado de LCP.
   - **Métrica afectada:** LCP.
   - **Causa raíz:** la cadena visible es documento (344 ms, 4,17 KiB) → CSS (596 ms, 7,23 KiB). Lighthouse reporta duración render-blocking del CSS de 0 ms; no se observa una oportunidad medible.
   - **Corrección propuesta:** no añadir `preconnect` (no hay orígenes candidatos) ni cambiar CSS sin evidencia de un cuello de botella real.
   - **Origen de la recomendación:** skill `performance` y análisis propio.
   - **Estado:** sin cambio propuesto.

3. **Problema:** CLS es 0,115; Lighthouse atribuye el desplazamiento al contenedor principal del dashboard.
   - **Métrica afectada:** CLS.
   - **Causa raíz:** la página empieza con `candidates` vacío y `listState` inactivo.
     Tras hidratarse, el dashboard solicita `/records?limit=1000` y luego inserta las candidaturas en una tabla inicialmente sin filas.
     Los contadores y avisos asíncronos también cambian cuando llega la respuesta.
     El proveedor y el dashboard tienen efectos que llaman `fetchCandidates()` cuando el estado es `idle`, por lo que pueden duplicar la solicitud.
     El fallback `Suspense` no cubre esta carga iniciada en `useEffect` por un Client Component.
     Véanse [CandidatesDashboard.tsx](../uis/talent-pipeline-tracker/components/CandidatesDashboard.tsx#L37), [el render de filas](../uis/talent-pipeline-tracker/components/CandidatesDashboard.tsx#L194), [CandidateContext.tsx](../uis/talent-pipeline-tracker/context/CandidateContext.tsx#L55) y [la carga del listado](../uis/talent-pipeline-tracker/context/CandidateContext.tsx#L64).
   - **Corrección aplicada:** se añadieron filas skeleton de altura estable y se asignó la carga automática a un único propietario para evitar una solicitud y actualización redundantes.
   - **Origen de la recomendación:** skill `performance` (reservar espacio para contenido que llega tarde) y análisis propio del flujo de datos.
   - **Estado:** aplicada en [CandidatesDashboard.tsx](../uis/talent-pipeline-tracker/components/CandidatesDashboard.tsx) y [DashboardShell.tsx](../uis/talent-pipeline-tracker/components/DashboardShell.tsx).

4. **Problema:** diagnóstico de 13,5 KiB de JavaScript legado y 22,6 KiB de JavaScript no utilizado.
   - **Métrica afectada:** tamaño/ejecución de JavaScript; TBT es 0 ms y Performance es 96.
   - **Causa raíz:** Lighthouse señala chunks, pero no identifica una importación propia de gran tamaño ni una tarea larga; son diagnósticos sin impacto directo señalado sobre la puntuación.
   - **Corrección propuesta:** ninguna por ahora; no cambiar transpilación, compatibilidad ni carga de módulos por cifras pequeñas sin identificar su origen.
   - **Origen de la recomendación:** skill `performance` y análisis propio.
   - **Estado:** sin cambio propuesto.

5. **Problema:** BFCache está deshabilitada por `Cache-Control: no-store` en el documento y una respuesta JavaScript; Lighthouse clasifica las causas como no accionables.
   - **Métrica afectada:** navegaciones atrás/adelante, no las métricas de carga inicial.
   - **Causa raíz:** el listado usa `fetch(..., { cache: "no-store" })` para datos dinámicos y el host preview puede controlar el cache header del documento. La captura no permite asignar ambos headers exclusivamente al código de la app.
   - **Corrección propuesta:** ninguna en este ciclo; no relajar la caché de datos ni cambiar headers del host sin confirmar el origen y las implicaciones.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** diagnóstico no accionable; pendiente de confirmar el host.

6. **Problema:** SEO es 60; Lighthouse informa `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** SEO e indexación.
   - **Causa raíz:** `app/layout.tsx` define título y descripción, sin directiva `robots`; no se encontró una regla `X-Robots-Tag`/`noindex` en la app. El header observado llega en el host preview `app.github.dev`. La aplicación se describe como un sistema interno.
   - **Corrección propuesta:** ninguna para hacer indexable el tracker; la no indexación es apropiada para esta herramienta interna. Si debe ser pública/indexable en otro despliegue, confirmar primero el origen del header en hosting/CDN.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** no se propone cambio; mantener la protección de indexación para la herramienta interna.

### 4. Análisis de refactorización

1. **Dónde aparece:** el `main` y el contenedor exterior se repiten en `DashboardFallback` de [app/page.tsx](../uis/talent-pipeline-tracker/app/page.tsx#L15) y en [CandidatesDashboard.tsx](../uis/talent-pipeline-tracker/components/CandidatesDashboard.tsx#L78).
   - **Por qué es candidato:** fallback y contenido cargado deben mantener el mismo ancho, padding y espaciado; las clases duplicadas podrían divergir.
   - **Abstracción compartida propuesta:** `DashboardShell({ children })` en `components/DashboardShell.tsx`, responsable del `main` y el contenedor exterior.
   - **Estado:** aplicada en [DashboardShell.tsx](../uis/talent-pipeline-tracker/components/DashboardShell.tsx); refactor de mantenibilidad, sin mejora CLS atribuible por sí sola.

2. **Dónde aparece:** la carga automática está en [CandidateContext.tsx](../uis/talent-pipeline-tracker/context/CandidateContext.tsx#L55); antes también se disparaba desde `CandidatesDashboard.tsx`.
   - **Por qué es candidato:** ambos observan `idle` e invocan la misma solicitud; el listado necesita un solo propietario de carga.
   - **Abstracción compartida propuesta:** centralizar el disparo de `fetchCandidates` en el contexto `useCandidates()` y hacer que `CandidatesDashboard` consuma `listState` y `candidates`.
   - **Estado:** aplicada al centralizar la carga automática en `CandidateProvider` y retirar el efecto duplicado de [CandidatesDashboard.tsx](../uis/talent-pipeline-tracker/components/CandidatesDashboard.tsx).

### 5. Evidencia de uso de la skill
- La skill `performance` recomienda reservar espacio para contenido que llega tarde. Esta guía sustenta el skeleton de tamaño estable implementado para las filas de la tabla.
- La skill recomienda actuar sobre la ruta de recursos medida y evitar hints especulativos. La cadena reporta CSS de 7,23 KiB sin duración render-blocking medible y no encuentra orígenes para `preconnect`; no se propone alterar esos recursos.
- La skill distingue TBT de INP. TBT es 0 ms y no se aportó INP; no se propone reducir JavaScript solo por los diagnósticos de chunks.

### 6. Validación de las correcciones
- ESLint de `app/page.tsx`, `components/CandidatesDashboard.tsx` y `components/DashboardShell.tsx`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto; Next.js advierte que hay dos `package-lock.json` y eligió el de la raíz como workspace root.
- Lighthouse posterior: registrado en [REPORT.md](./REPORT.md); no ejecutado por el agente.

---

## administrar_incidentes — Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`)

### 1. Condiciones de la medición
- Modo: escritorio.
- Ejecución: build de producción servido con `next start` (mismo setup confirmado por el usuario).
- Acceso: sin login; consume la base de datos por medio de `services/manage_incidentsAPI`.
- La captura muestra 3 incidentes en el resumen; no se confirmó si hay más registros fuera de los visibles.
- Captura recibida en `audit/before/administrar_incidentes.home-before.png`. Se conserva ese nombre existente; la convención para futuras capturas sería `administrar_incidentes-home-before.png`.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 100 |
| Accessibility | 89 |
| Best Practices | 100 |
| SEO | 60 |

Métricas clave: TTFB no visible; FCP 0,5 s; LCP 0,5 s; CLS 0; TBT 0 ms; INP no disponible; Speed Index 0,8 s.

Captura: ![Lighthouse antes](./before/administrar_incidentes.home-before.png)

### 3. Problemas identificados

1. **Problema:** TTFB no aparece; el árbol de dependencias muestra navegación inicial de 331 ms y latencia crítica máxima de 721 ms hasta una hoja CSS de 3,71 KiB.
   - **Métrica afectada:** TTFB y ruta crítica.
   - **Causa raíz:** Lighthouse no entrega TTFB como métrica en la captura. El CSS aparece con duración render-blocking de 0 ms; no hay evidencia para atribuir la latencia al código del dashboard.
   - **Corrección propuesta:** ninguna sin TTFB o traza que localice el tiempo de respuesta del documento.
   - **Origen de la recomendación:** análisis propio; skill `performance` recomienda priorizar recursos de la ruta crítica medidos.
   - **Estado:** pendiente de datos.

2. **Problema:** LCP es 0,5 s y CLS es 0; Performance ya es 100.
   - **Métrica afectada:** LCP y CLS.
   - **Causa raíz:** no hay una regresión medida. El único recurso bloqueante mostrado es CSS con 0 ms de duración, y Lighthouse no encuentra candidatos de `preconnect`.
   - **Corrección propuesta:** conservar la carga actual; no añadir hints ni cambiar CSS sin oportunidad medida.
   - **Origen de la recomendación:** skill `performance` y análisis propio.
   - **Estado:** sin cambio propuesto.

3. **Problema:** Accessibility es 89. Lighthouse identifica siete `<select>` sin nombre accesible.
      - **Corrección aplicada:** los cuatro filtros usan nombres accesibles descriptivos; los selectores de estado anuncian título e ID del incidente. Los tres selects del formulario mantienen sus etiquetas visibles.
      - **Estado:** aplicada en [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx), [IncidentRow.tsx](../uis/backoffices/administrar_incidentes/components/IncidentRow.tsx) y [IncidentStatusSelect.tsx](../uis/backoffices/administrar_incidentes/components/IncidentStatusSelect.tsx).
   - **Métrica afectada:** Accessibility.
   - **Causa raíz:** los cuatro controles de filtro no tienen `<label>` ni `aria-label`; los selectores de estado del resultado de búsqueda y de cada fila tampoco tienen un nombre accesible. Los tres selects del formulario sí quedan asociados a `Field`. Véase [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx#L70).
   - **Corrección propuesta:** asociar cada filtro con una etiqueta visible o `aria-label` descriptiva, y nombrar cada selector de estado con el incidente correspondiente (por ejemplo, su ID/título). Mantener los labels ya existentes del formulario.
   - **Origen de la recomendación:** análisis propio a partir de los elementos fallidos de Lighthouse.
   - **Estado:** aplicada en [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx), [IncidentRow.tsx](../uis/backoffices/administrar_incidentes/components/IncidentRow.tsx) y [IncidentStatusSelect.tsx](../uis/backoffices/administrar_incidentes/components/IncidentStatusSelect.tsx).

4. **Problema:** Lighthouse informa que varios textos y controles no alcanzan contraste suficiente.
      - **Corrección aplicada:** se oscurecieron los tokens compartidos de texto naranja y texto atenuado, y se retiró opacidad de etiquetas pequeñas de métricas e identificadores para mejorar contraste en superficies claras.
      - **Estado:** aplicada en [globals.css](../uis/backoffices/administrar_incidentes/app/globals.css).
   - **Métrica afectada:** Accessibility.
   - **Causa raíz:** `--orange: #e85d2a` se usa como color de texto pequeño sobre fondos claros y como fondo de botones con texto blanco; además `.metric span` reduce el contraste con `opacity: .7`. El reporte señala elementos `.eyebrow`, etiquetas de métricas y botones. Véase [globals.css](../uis/backoffices/administrar_incidentes/app/globals.css#L2).
   - **Corrección propuesta:** separar los tokens de acento para texto y superficies; elegir pares de color con contraste WCAG AA para texto normal y retirar opacidad de etiquetas pequeñas. Verificar botones, métricas y etiquetas con las combinaciones reales de fondo.
   - **Origen de la recomendación:** análisis propio a partir del audit de contraste de Lighthouse.
   - **Estado:** aplicada en [globals.css](../uis/backoffices/administrar_incidentes/app/globals.css).

5. **Problema:** el contenido de la aplicación está en español, pero el documento declara `lang="en"`.
      - **Corrección aplicada:** el root layout ahora declara `lang="es"`.
      - **Estado:** aplicada en [layout.tsx](../uis/backoffices/administrar_incidentes/app/layout.tsx#L12).
   - **Métrica afectada:** accesibilidad semántica y pronunciación en tecnologías de asistencia.
   - **Causa raíz:** atributo de idioma incorrecto en [layout.tsx](../uis/backoffices/administrar_incidentes/app/layout.tsx#L12).
   - **Corrección propuesta:** cambiar el idioma del documento a `es`.
   - **Origen de la recomendación:** análisis propio del código.
   - **Estado:** aplicada en [layout.tsx](../uis/backoffices/administrar_incidentes/app/layout.tsx#L12).

6. **Problema:** SEO es 60; Lighthouse muestra `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** indexación SEO.
   - **Causa raíz:** la metadata de Next.js define título y descripción, sin directiva `robots`; no aparece una regla `X-Robots-Tag` en el código del frontend. El header se informa para el host preview `app.github.dev`, por lo que su origen parece externo a la ruta Next.js. Al tratarse de un backoffice de operaciones, no indexarlo es razonable.
   - **Corrección propuesta:** ninguna para habilitar indexación en el backoffice; mantenerlo fuera de buscadores. Si la política de despliegue exige indexarlo, confirmar y cambiar el header en la capa que lo añade.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** no se propone cambio; verificar política del despliegue.

7. **Problema:** los diagnósticos estiman 13,5 KiB de JavaScript legado y 43,9 KiB de JavaScript no utilizado (102,1 KiB transferidos en los recursos mostrados); BFCache no está disponible por respuestas `Cache-Control: no-store`, marcadas como no accionables.
   - **Métrica afectada:** JavaScript y restauración atrás/adelante; Performance es 100 y TBT es 0 ms.
   - **Causa raíz:** Lighthouse no identifica un módulo de aplicación concreto y el `no-store` también puede proceder del host/API. No hay evidencia para reducir código ni relajar caché de datos.
   - **Corrección propuesta:** ninguna en este ciclo. Revisar mapa de bundles si el coste JavaScript empeora; no cambiar la caché de respuestas del backend sin validar las implicaciones operativas.
   - **Origen de la recomendación:** skill `performance` y análisis propio.
   - **Estado:** diagnósticos sin cambio propuesto.

### 4. Análisis de refactorización

1. **Dónde aparece:** la misma fila de incidente se renderiza para `searchResult` y para `incidents.map(...)` en [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx#L70).
   - **Por qué es candidato:** ambas variantes muestran identificador, categoría, sede y selector de estado con la misma estructura.
   - **Abstracción compartida propuesta:** `IncidentRow({ incident, onStatusChange })` en `components/IncidentRow.tsx`.
   - **Estado:** aplicada en [IncidentRow.tsx](../uis/backoffices/administrar_incidentes/components/IncidentRow.tsx).

2. **Dónde aparece:** el selector `.status-select` se repite para el resultado individual y cada fila del listado en [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx#L70).
   - **Por qué es candidato:** duplica opciones, estilos y la acción de cambio de estado; es además el mismo tipo de control al que Lighthouse detectó falta de nombre accesible.
   - **Abstracción compartida propuesta:** `IncidentStatusSelect({ incident, onChange })` en `components/IncidentStatusSelect.tsx`, con nombre accesible contextual.
   - **Estado:** aplicada en [IncidentStatusSelect.tsx](../uis/backoffices/administrar_incidentes/components/IncidentStatusSelect.tsx).

### 5. Evidencia de uso de la skill
- La skill `performance` recomienda priorizar métricas y recursos realmente medidos. Performance es 100, TBT 0 ms y el CSS render-blocking indica 0 ms; no se propone cambiar la ruta crítica ni añadir `preconnect` sin un objetivo medible.
- La skill distingue TBT de INP y recomienda no cambiar JavaScript por estimaciones aisladas. No hay INP ni una tarea larga identificada en la captura; los diagnósticos JS quedan documentados, no tratados como regresión confirmada.

### 6. Validación de las correcciones
- ESLint (`npm run lint`): correcto.
- TypeScript (`npx tsc --noEmit`): correcto.
- Build de producción (`npm run build`): correcto; Next.js advierte que detectó múltiples `package-lock.json` y eligió el lockfile raíz como workspace root.
- La app no define un script de pruebas.
- No se ejecutó Lighthouse; la medición posterior queda pendiente.

---

## suppliers_tinydb — Inicio (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/`)

### 1. Condiciones de la medición
- Modo: escritorio.
- Ejecución: build de producción servido con `next start`.
- Acceso: se requiere autenticación; consume la API de proveedores conectada a TinyDB (confirmado por el usuario).
- Volumen de datos: no especificado.
- Capturas compartidas en ocho imágenes. Para que los enlaces funcionen, guardarlas en `audit/before/` como `suppliers_tinydb-home-before-1.png` hasta `suppliers_tinydb-home-before-8.png`.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 99 |
| Accessibility | 90 |
| Best Practices | 100 |
| SEO | 60 |

Métricas clave: TTFB no visible; FCP 0,4 s; LCP 0,7 s; CLS 0,01; TBT 0 ms; INP no disponible; Speed Index 1,1 s.

Capturas: ![Lighthouse antes 1](./before/suppliers_tinydb-home-before-1.png) ![Lighthouse antes 2](./before/suppliers_tinydb-home-before-2.png) ![Lighthouse antes 3](./before/suppliers_tinydb-home-before-3.png) ![Lighthouse antes 4](./before/suppliers_tinydb-home-before-4.png) ![Lighthouse antes 5](./before/suppliers_tinydb-home-before-5.png) ![Lighthouse antes 6](./before/suppliers_tinydb-home-before-6.png) ![Lighthouse antes 7](./before/suppliers_tinydb-home-before-7.png) ![Lighthouse antes 8](./before/suppliers_tinydb-home-before-8.png)

### 3. Problemas identificados

1. **Problema:** TTFB no aparece en las capturas. El árbol de dependencias indica 354 ms para la navegación y una latencia crítica máxima de 695 ms hasta un chunk CSS de 8,04 KiB; el diagnóstico de recursos que bloquean el render muestra 0 ms de duración.
   - **Métrica afectada:** TTFB/ruta crítica; no se identifica una degradación medible de LCP.
   - **Causa raíz:** la captura no desglosa el tiempo de respuesta del documento ni atribuye la latencia al código de la aplicación. La hoja CSS se sirve desde el host de preview y Lighthouse no mide duración de bloqueo para ese recurso. No se infiere que los 354 ms sean TTFB.
   - **Corrección propuesta:** ninguna sin una captura que muestre TTFB o una traza que ubique el tiempo de espera. No añadir `preconnect` especulativo: Lighthouse no señala orígenes candidatos.
   - **Origen de la recomendación:** análisis propio; skill `performance` recomienda actuar sobre recursos de la ruta crítica que estén identificados por medición.
   - **Estado:** sin cambio propuesto; pendiente de evidencia adicional.

2. **Problema:** LCP 0,7 s, CLS 0,01, TBT 0 ms y Performance 99; las capturas no muestran una oportunidad concreta con causa atribuible al renderizado de la app.
   - **Métrica afectada:** LCP, CLS, TBT y Performance.
   - **Causa raíz:** no hay evidencia de imagen LCP sobredimensionada, cambio de layout relevante o tarea larga. La página renderiza una vista de gestión autenticada en [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx); los screenshots no muestran una medición del coste de la tabla ni indican el volumen cargado.
   - **Corrección propuesta:** ninguna de rendimiento por ahora; no se optimiza el código solo para subir un score ya alto. Si se evalúa una sesión con muchos registros, aportar volumen y traza de interacción para localizar coste real.
   - **Origen de la recomendación:** análisis propio y skill `performance` (priorizar señales medidas y no tratar TBT como INP).
   - **Estado:** sin cambio propuesto.

3. **Problema:** Accessibility es 90; Lighthouse informa que los controles de formulario no tienen etiquetas asociadas para varios campos numéricos de tarifa.
   - **Métrica afectada:** Accessibility; nombres accesibles de los controles.
   - **Causa raíz:** el campo de edición de tarifa por proveedor en `SupplierQuickActions` ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L1120)) no tiene `<label>`, `id`/`htmlFor` ni `aria-label`. Se instancia por cada proveedor, lo que explica las múltiples instancias fallidas mostradas.
   - **Corrección propuesta:** añadir un nombre accesible contextual a cada campo (por ejemplo, “Tarifa por unidad para {nombre del proveedor}”), conservando el control y su comportamiento.
   - **Origen de la recomendación:** análisis propio del elemento fallido de Lighthouse; la skill orienta a corregir problemas reales del usuario, no a perseguir la puntuación.
   - **Estado:** aplicada en [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx), con un nombre accesible contextual por proveedor.

4. **Problema:** Lighthouse señala que un campo tiene varias etiquetas.
   - **Métrica afectada:** Accessibility; interpretación del nombre/agrupación del campo por tecnología asistiva.
   - **Causa raíz:** `FieldShell` devuelve un `<label>` ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L1037)) y el grupo “Categorías” lo usa como contenedor de las etiquetas `<label>` de cada checkbox ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L480)). El HTML anida etiquetas y provoca la asociación múltiple reportada.
   - **Corrección propuesta:** representar el grupo de categorías con `fieldset`/`legend` y mantener cada checkbox dentro de su propia etiqueta; conservar el texto de error y el estilo existente.
   - **Origen de la recomendación:** análisis propio del elemento fallido de Lighthouse.
   - **Estado:** aplicado en [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx); el grupo usa `fieldset`/`legend` y mantiene etiquetas individuales para los checkboxes.

5. **Problema:** SEO es 60; Lighthouse informa `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** SEO e indexación.
   - **Causa raíz:** el layout declara título y descripción en [layout.tsx](../uis/backoffices/suppliers_tinydb/app/layout.tsx#L20), pero no declara `robots`. La aplicación es un backoffice que requiere autenticación y se midió en un host de preview; el header observado no se atribuye a una regla de la aplicación.
   - **Corrección propuesta:** ninguna para hacer indexable esta herramienta interna. Mantener la protección; si existe un despliegue público que deba indexarse, comprobar primero su host y las directivas del proxy/CDN.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** no se propone cambio; noindex es coherente con el acceso restringido.

### 4. Análisis de refactorización

1. **Dónde aparece:** el nombre, ID y email del proveedor se presentan en la tarjeta móvil ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L675)) y en la primera columna de la tabla de escritorio ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L802)).
   - **Por qué es candidato:** ambas vistas muestran los mismos datos de identidad con estructura y variantes de estilo distintas; los cambios de campos podrían divergir.
   - **Abstracción compartida propuesta:** `SupplierIdentity({ supplier, compact })` en `components/SupplierIdentity.tsx`, para compartir los datos/semántica y permitir variantes visuales explícitas.
   - **Estado:** aplicado en [SupplierIdentity.tsx](../uis/backoffices/suppliers_tinydb/components/SupplierIdentity.tsx) e integrado en las vistas móvil y escritorio de [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx).

2. **Dónde aparece:** las categorías del proveedor se recorren y se muestran con las mismas etiquetas y badges en la tarjeta móvil ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L696)) y en la tabla de escritorio ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L826)).
   - **Por qué es candidato:** se repiten el mapeo de categorías y la presentación visual; una lista compartida reduciría divergencias entre vistas.
   - **Abstracción compartida propuesta:** `SupplierCategoryList({ categories, compact })` en `components/SupplierCategoryList.tsx`, con las etiquetas procedentes de `CATEGORY_LABELS`.
   - **Estado:** aplicado en [SupplierCategoryList.tsx](../uis/backoffices/suppliers_tinydb/components/SupplierCategoryList.tsx) e integrado en las vistas móvil y escritorio de [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx).

### 5. Evidencia de uso de la skill
- La skill `performance` indica que los cambios deben dirigirse a recursos o tareas identificados y desaconseja hints especulativos. Por ello, la cadena crítica y el chunk CSS quedan documentados, pero no se propone añadir `preconnect` ni modificar el CSS: no hay evidencia de bloqueo medible y Performance es 99.
- La skill distingue TBT de INP; TBT es 0 ms y no se aportó INP ni una tarea larga. No se propone reducir JavaScript sobre la base de este informe.
- La revisión de código sí permite vincular dos hallazgos de accesibilidad con controles concretos; se proponen cambios semánticos pequeños, sujetos a aprobación.

### 6. Validación de las correcciones
- Después de cada cambio: ESLint enfocado en los componentes afectados, `npx tsc --noEmit` y `npm run build`: correctos.
- La app no define un script de pruebas; no se ejecutaron pruebas automatizadas.
- Lighthouse no fue ejecutado por el agente. La medición posterior queda pendiente de una nueva medición del usuario.

---

## analizador_incidentes — Incidencias (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/incidents`)

### 1. Condiciones de la medición
- Modo: escritorio, según el alcance de esta auditoría.
- Ejecución: servidor iniciado con `npm run start`, según el usuario; ruta `/incidents`.
- Acceso: requiere iniciar sesión; la autenticación depende de `/services/JWTauth_api`.
- Datos: no se cargó un CSV de análisis en las capturas; la vista observada corresponde al estado inicial de carga.
- Capturas compartidas en ocho imágenes. Para que los enlaces funcionen, guardarlas en `audit/before/` como `analizador_incidentes-incidents-before-1.png` hasta `analizador_incidentes-incidents-before-8.png`.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 76 |
| Accessibility | 95 |
| Best Practices | 100 |
| SEO | 60 |

Métricas clave: TTFB no visible; FCP 0,4 s; LCP 0,7 s; CLS 0,649; TBT 0 ms; INP no disponible; Speed Index 1,3 s.

Capturas: ![Lighthouse antes 1](./before/analizador_incidentes-incidents-before-1.png) ![Lighthouse antes 2](./before/analizador_incidentes-incidents-before-2.png) ![Lighthouse antes 3](./before/analizador_incidentes-incidents-before-3.png) ![Lighthouse antes 4](./before/analizador_incidentes-incidents-before-4.png) ![Lighthouse antes 5](./before/analizador_incidentes-incidents-before-5.png) ![Lighthouse antes 6](./before/analizador_incidentes-incidents-before-6.png) ![Lighthouse antes 7](./before/analizador_incidentes-incidents-before-7.png) ![Lighthouse antes 8](./before/analizador_incidentes-incidents-before-8.png)

### 3. Problemas identificados

1. **Problema:** CLS es 0,649. Lighthouse atribuye un desplazamiento de 0,598 al `body` mientras se carga una fuente web; también muestra un desplazamiento de 0,051 en el pie de página y señala archivos `.woff2` como fuentes del cambio.
   - **Métrica afectada:** CLS y Performance.
   - **Causa raíz:** el layout configura `Inter` y `Poppins` mediante `next/font/google` en [layout.tsx](../uis/backoffices/analizador_incidentes/app/layout.tsx#L2). El `body` usa Inter en [globals.css](../uis/backoffices/analizador_incidentes/app/globals.css#L26), y la página y el pie usan texto de la aplicación sujeto a la carga de estas fuentes. La evidencia de Lighthouse vincula el cambio de métrica al intercambio de la fuente renderizada; no apunta a una imagen ni a la carga de resultados de la API.
   - **Corrección propuesta:** ajustar la estrategia de visualización de las fuentes de `next/font` para evitar el intercambio tardío que desplaza el contenido (por ejemplo, probar `display: "optional"` en las declaraciones afectadas). Validar que el fallback siga siendo legible y que la tipografía de marca no quede inesperadamente sin aplicar en la primera carga.
   - **Origen de la recomendación:** análisis propio a partir del elemento y los archivos señalados; skill `performance`, que recomienda reservar/estabilizar el contenido y actuar sobre causas de CLS medidas.
   - **Estado:** aplicada en [layout.tsx](../uis/backoffices/analizador_incidentes/app/layout.tsx) mediante `display: "optional"` en las fuentes afectadas; la verificación de CLS y del fallback queda pendiente de la re-medición.

2. **Problema:** Accessibility es 95; Lighthouse detecta contraste insuficiente en el botón “Analizar incidencias”.
   - **Métrica afectada:** Accessibility; contraste de texto y fondo.
   - **Causa raíz:** el botón se define con texto blanco sobre fondo `#f97316` en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L223). El color de texto no alcanza el contraste mínimo para texto normal sobre ese fondo.
   - **Corrección propuesta:** ajustar el par de colores del botón (texto/fondo y estado hover/disabled) para cumplir el contraste WCAG sin cambiar su acción ni quitar contenido.
   - **Origen de la recomendación:** análisis propio del elemento fallido de Lighthouse.
   - **Estado:** aplicado en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx), con colores más oscuros para conservar texto blanco legible en reposo y hover.

3. **Problema:** el árbol de dependencias muestra una latencia crítica máxima de 1.086 ms desde la navegación `/incidents` (612 ms) hasta un chunk CSS de 7,99 KiB; el diagnóstico de recursos que bloquean el render informa duración de 0 ms.
   - **Métrica afectada:** TTFB/ruta crítica y LCP; TTFB no aparece como medición individual.
   - **Causa raíz:** la captura no separa el tiempo de respuesta del documento del resto de la cadena, ni demuestra que el servidor de la app o el CSS provoquen el retraso. El chunk se sirve en el host de preview; Lighthouse no atribuye un tiempo de bloqueo medible al CSS.
   - **Corrección propuesta:** ninguna sin TTFB explícito o una traza que ubique el tiempo en el servidor o en una solicitud concreta. No añadir `preconnect`: Lighthouse indica que no hay orígenes candidatos.
   - **Origen de la recomendación:** análisis propio; skill `performance`, que recomienda no añadir hints de recursos sin evidencia en la ruta crítica.
   - **Estado:** sin cambio propuesto; falta evidencia para atribuir una causa corregible.

4. **Problema:** Lighthouse estima 14 KiB de JavaScript legado y 134 KiB de JavaScript no utilizado; la tabla incluye aproximadamente 58,4 KiB del chunk de la app, además de recursos de extensiones de Chrome. También registra una tarea de 50 ms, mientras TBT es 0 ms.
   - **Métrica afectada:** potencial carga/ejecución de JavaScript; el diagnóstico está marcado como no puntuable. No hay INP.
   - **Causa raíz:** la captura mezcla aproximadamente 180,7 KiB de recursos no atribuibles, incluyendo scripts `chrome-extension://`, con 58,4 KiB del chunk de la app; no aporta un mapa de bundles ni una traza que identifique módulos de la app evitables. La tarea de 50 ms, por sí sola, no explica TBT ni el CLS observado.
   - **Corrección propuesta:** ninguna en esta ronda. Repetir en un perfil limpio, sin extensiones, y usar un análisis de bundle/traza si el coste de JavaScript sigue siendo relevante.
   - **Origen de la recomendación:** análisis propio y skill `performance` (distinguir TBT de INP y priorizar diagnósticos atribuibles y medidos).
   - **Estado:** sin cambio propuesto; requiere evidencia limpia antes de tocar el bundle.

5. **Problema:** SEO es 60; Lighthouse informa que la página está bloqueada para indexación por `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** SEO e indexación.
   - **Causa raíz:** la ruta es parte de un backoffice autenticado; el header observado corresponde al host preview y no se encontró evidencia de que la aplicación añada esa directiva.
   - **Corrección propuesta:** ninguna para hacer indexable esta herramienta interna; conservar la protección contra indexación.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** no se propone cambio; noindex es coherente con el acceso restringido.

### 4. Análisis de refactorización

1. **Dónde aparece:** las barras de porcentaje de satisfacción y de categorías repiten el contenedor, el track y el relleno con ancho porcentual en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L408) y [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L441).
   - **Por qué es candidato:** ambas visualizaciones codifican el mismo patrón gráfico y dependen del porcentaje; estilos o comportamiento podrían divergir.
   - **Abstracción compartida propuesta:** `PercentageBar({ percentage, className? })` en `components/PercentageBar.tsx`, conservando el clamp actual del valor y permitiendo el margen externo en cada consumidor.
   - **Estado:** aplicado en [PercentageBar.tsx](../uis/backoffices/analizador_incidentes/components/PercentageBar.tsx) e integrado en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx); se conservan los gradientes y el espaciado de cada barra.

2. **Dónde aparece:** las cuatro tarjetas de métricas generales y las tres tarjetas compactas de satisfacción repiten la presentación de etiqueta y valor destacado en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L317) y [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L376).
   - **Por qué es candidato:** comparten jerarquía visual y formato del valor, aunque las tarjetas compactas omiten una descripción.
   - **Abstracción compartida propuesta:** `AnalysisMetricCard({ label, value, description?, compact? })` en `components/AnalysisMetricCard.tsx`, con variante compacta explícita para preservar ambos diseños.
   - **Estado:** aplicado en [AnalysisMetricCard.tsx](../uis/backoffices/analizador_incidentes/components/AnalysisMetricCard.tsx) e integrado en [IncidentAnalyzer.tsx](../uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx), con variantes completa y compacta.

### 5. Evidencia de uso de la skill
- La skill `performance` recomienda corregir desplazamientos de layout identificando el elemento que se mueve y estabilizar el espacio/estilo antes de la carga. La captura atribuye el CLS al cambio de fuentes, por lo que la propuesta se centra en la política de visualización de `next/font`, no en el contenido ni en la carga de datos.
- La skill aconseja medir la ruta crítica antes de añadir preloads o `preconnect`. El CSS muestra 0 ms de bloqueo y no hay origen candidato; no se propone alterar la ruta de recursos.
- La skill distingue los diagnósticos de TBT e INP y recomienda evaluar JavaScript atribuible a la app. La captura incluye extensiones del navegador y solo muestra una tarea de 50 ms; se pide repetir en perfil limpio antes de proponer cambios de bundle.

### 6. Validación de las correcciones
- ESLint enfocado en `app/layout.tsx`, `components/IncidentAnalyzer.tsx`, `components/PercentageBar.tsx` y `components/AnalysisMetricCard.tsx`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto; las rutas `/incidents` y API se generan como se esperaba.
- No se ejecutaron pruebas automatizadas. Lighthouse no fue ejecutado por el agente; la medición posterior aportada por el usuario y su comparación están registradas en [REPORT.md](./REPORT.md). La alerta de IndexedDB deja pendiente una ejecución de confirmación en incógnito.

---

## administrar_inventario — Productos (`https://fuzzy-space-computing-machine-5g4qpxv57495cv6vx-3000.app.github.dev/backoffice/inventory/products`)

### 1. Condiciones de la medición
- Modo: escritorio, de acuerdo con el alcance de la auditoría.
- Ejecución: `npm run build` y `npm run start`, confirmado por el usuario.
- Acceso: autenticado; depende de `/Services/JWTauth_API` y de la base de datos servida por `/Services/`.
- Página: catálogo de productos; la ruta declarada en Next.js es `/backoffice/inventory/products`.
- Volumen: el dashboard muestra el catálogo, pero no se especificó el total de productos.
- Capturas compartidas en diez imágenes. Para que los enlaces funcionen, guardarlas en `audit/before/` como `administrar_inventario-products-before-1.png` hasta `administrar_inventario-products-before-10.png`.

### 2. Puntuaciones iniciales
| Categoría | Puntuación |
|---|---:|
| Performance | 97 |
| Accessibility | 96 |
| Best Practices | 100 |
| SEO | 60 |

Métricas clave: TTFB 0,32 s según el desglose LCP; FCP 0,4 s; LCP 0,6 s según el resumen; CLS 0,02; TBT 0 ms; INP no disponible; Speed Index 1,9 s.

Nota de consistencia: el desglose de LCP también muestra un retraso de renderizado de 2.040 ms, valor incompatible con el LCP total resumido de 0,6 s. Se conserva el LCP del resumen y no se usa ese desglose contradictorio para proponer una optimización.

Capturas: ![Lighthouse antes 1](./before/administrar_inventario-products-before-1.png) ![Lighthouse antes 2](./before/administrar_inventario-products-before-2.png) ![Lighthouse antes 3](./before/administrar_inventario-products-before-3.png) ![Lighthouse antes 4](./before/administrar_inventario-products-before-4.png) ![Lighthouse antes 5](./before/administrar_inventario-products-before-5.png) ![Lighthouse antes 6](./before/administrar_inventario-products-before-6.png) ![Lighthouse antes 7](./before/administrar_inventario-products-before-7.png) ![Lighthouse antes 8](./before/administrar_inventario-products-before-8.png) ![Lighthouse antes 9](./before/administrar_inventario-products-before-9.png) ![Lighthouse antes 10](./before/administrar_inventario-products-before-10.png)

### 3. Problemas identificados

1. **Problema:** CLS es 0,02; Lighthouse atribuye el desplazamiento observado (0,02) al texto de referencia bajo la tabla de productos.
   - **Métrica afectada:** CLS.
   - **Causa raíz:** el catálogo se obtiene en cliente desde `useProducts()` ([InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L77)); mientras `loading` es verdadero, `ProductsPage` muestra una fila única de carga y luego la reemplaza por las filas recibidas ([InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L188)). El texto de referencia está después de la tabla ([InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L233)); el cambio de altura de la tabla puede desplazarlo. El selector de Lighthouse identifica el nodo desplazado, no demuestra por sí solo que sea el origen inicial, por lo que esta relación es una hipótesis sustentada en el flujo de carga.
   - **Corrección propuesta:** estabilizar el espacio de la tabla durante la consulta (por ejemplo, placeholder/skeleton de filas con altura consistente), evitando que el aviso inferior salte al llegar los datos. Ajustar el espacio al volumen real que se use en la medición para no reservar una región desproporcionada.
   - **Origen de la recomendación:** análisis propio; skill `performance`, que recomienda reservar espacio para contenido que aparece o cambia al cargar.
   - **Estado:** aplicado en [InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx): la tabla presenta ocho filas placeholder de altura estable durante la carga y anuncia el estado con `aria-busy`. Confirmar el efecto con la re-medición y el volumen de datos representativo.

2. **Problema:** Accessibility es 96; Lighthouse señala contraste insuficiente en textos de metadatos, cabeceras y navegación.
   - **Métrica afectada:** Accessibility; contraste visual.
   - **Causa raíz:** varios textos pequeños de la interfaz usan blanco con baja opacidad, por ejemplo `text-white/35` en el aviso bajo la tabla y el rótulo “Operación”, `text-white/40` en encabezados de tabla y metadatos, y `text-white/45` para el correo de sesión ([InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L178), [BackofficeShell.tsx](../uis/backoffices/administrar_inventario/components/BackofficeShell.tsx#L53)). Estos valores reducen el contraste en las superficies oscuras, como muestran los elementos fallidos.
   - **Corrección propuesta:** ajustar únicamente los colores de texto de los elementos que Lighthouse marca para que cumplan contraste suficiente sobre sus fondos reales; verificar también los estados de navegación y texto de tabla sin cambiar el estilo de superficies.
   - **Origen de la recomendación:** análisis propio de los elementos fallidos de Lighthouse.
   - **Estado:** aplicado en [InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx) y [BackofficeShell.tsx](../uis/backoffices/administrar_inventario/components/BackofficeShell.tsx), elevando el contraste de los textos reportados.

3. **Problema:** el árbol de dependencias informa 601 ms de latencia crítica máxima desde la navegación hasta un chunk CSS de 6,96 KiB; la duración render-blocking indicada es 0 ms y no hay candidatos de `preconnect`.
   - **Métrica afectada:** cadena crítica/LCP; TTFB del documento según desglose: 320 ms.
   - **Causa raíz:** la captura no asigna los 601 ms al tiempo de respuesta del servidor ni muestra bloqueo medible del CSS. El recurso CSS se sirve desde el mismo host del frontend. El retraso de renderizado de 2.040 ms en el desglose LCP contradice el LCP total de 0,6 s.
   - **Corrección propuesta:** ninguna hasta obtener un desglose LCP consistente o una traza que localice tiempo en una solicitud/código concreto; no añadir `preconnect` especulativo.
   - **Origen de la recomendación:** análisis propio y skill `performance` (no añadir hints sin evidencia de un origen crítico ni confundir latencia de cadena con TTFB).
   - **Estado:** pendiente de evidencia consistente; sin cambio propuesto.

4. **Problema:** Lighthouse estima 14 KiB de JavaScript legado y 25 KiB de JavaScript no utilizado en un chunk first-party de 67 KiB. Performance es 97 y TBT es 0 ms.
   - **Métrica afectada:** transferencia/ejecución de JavaScript potencial; diagnósticos no puntuables.
   - **Causa raíz:** la captura identifica un chunk de la aplicación, pero no incluye mapa de bundles ni demuestra qué módulos pueden diferirse sin afectar la experiencia autenticada.
   - **Corrección propuesta:** no reducir ni diferir JavaScript en esta ronda sin analizar el bundle y confirmar una interacción lenta; conservar el código necesario para la vista.
   - **Origen de la recomendación:** skill `performance` y análisis propio; priorizar tareas/recursos que expliquen una métrica real y no perseguir ahorro estimado aislado.
   - **Estado:** sin cambio propuesto.

5. **Problema:** SEO es 60; Lighthouse informa `X-Robots-Tag: noindex, nofollow`.
   - **Métrica afectada:** SEO e indexación.
   - **Causa raíz:** es un backoffice interno que requiere inicio de sesión, y la directiva observada procede del host de preview.
   - **Corrección propuesta:** ninguna; mantener la página fuera de índices públicos.
   - **Origen de la recomendación:** análisis propio.
   - **Estado:** no se propone cambio; la directiva es apropiada para una ruta autenticada.

### 4. Análisis de refactorización

1. **Dónde aparece:** el patrón de encabezado de página está centralizado en `PageHeading` y se utiliza para Productos y las páginas de movimientos en [InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L35).
   - **Por qué es candidato:** los títulos y descripciones de estas rutas comparten jerarquía y estilos; el helper existente ya evita duplicar ese markup.
   - **Abstracción compartida propuesta:** `PageHeading({ eyebrow, title, description, action? })`, ya implementado dentro de `components/InventoryPages.tsx`.
   - **Estado:** abstracción compartida existente; no se propone extracción adicional.

2. **Dónde aparece:** los datos de productos se solicitan en [InventoryPages.tsx](../uis/backoffices/administrar_inventario/components/InventoryPages.tsx#L77) y se usan tanto en la página del catálogo como en los formularios de entrada/salida.
   - **Por qué es candidato:** compartir una sola lógica de carga evita repetir estados de loading/error y peticiones en cada formulario; la implementación actual ya usa el hook local `useProducts`.
   - **Abstracción compartida propuesta:** `useProducts()`, ya implementado localmente en `components/InventoryPages.tsx`.
   - **Estado:** abstracción compartida existente; no se propone extracción adicional.

### 5. Evidencia de uso de la skill
- La skill `performance` recomienda reservar espacio para contenido tardío cuando existe CLS; el listado cargado por cliente sustituye una fila de carga por múltiples filas y el nodo desplazado está debajo de la tabla. Por ello se propone estabilizar la región, condicionado a validar el volumen esperado.
- La skill recomienda actuar sobre recursos de bloqueo medible. El CSS indica 0 ms de bloqueo y no hay origen de `preconnect`; no se propone cambiar la ruta de recursos.
- La skill distingue TBT de INP y recomienda no diferir JavaScript solo por diagnósticos de ahorro. TBT es 0 ms y Performance es 97; no se propone tocar el bundle sin evidencia de tareas lentas.

### 6. Validación de las correcciones
- `npx eslint` en los componentes afectados con la regla preexistente `react-hooks/set-state-in-effect` desactivada: sin errores; permanecen avisos preexistentes por imports sin uso (`RefreshCw` y `Boxes`). La primera ejecución de ESLint también detectó tres errores de esa regla en efectos no modificados de `InventoryPages.tsx`.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto tras repetir el comando. Next.js 16.4.0 muestra un aviso de vulnerabilidad conocida y recomienda actualizar; el primer intento detuvo el build para mostrar el aviso y el reintento terminó correctamente. También aparece el aviso previo de múltiples lockfiles.
- No se ejecutaron pruebas automatizadas. Lighthouse no fue ejecutado por el agente; CLS y Accessibility quedan pendientes de re-medición.