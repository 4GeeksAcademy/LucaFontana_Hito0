   - **Estado:** aplicada en [IncidentRow.tsx](../uis/backoffices/administrar_incidentes/components/IncidentRow.tsx).
   - **Estado:** aplicada en [IncidentStatusSelect.tsx](../uis/backoffices/administrar_incidentes/components/IncidentStatusSelect.tsx).
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
   - **Estado:** aplicada en [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx), con un nombre accesible contextual por proveedor.

4. **Problema:** Lighthouse informa que varios textos y controles no alcanzan contraste suficiente.
      - **Corrección aplicada:** se oscurecieron los tokens compartidos de texto naranja y texto atenuado, y se retiró opacidad de etiquetas pequeñas de métricas e identificadores para mejorar contraste en superficies claras.
      - **Estado:** aplicada en [globals.css](../uis/backoffices/administrar_incidentes/app/globals.css).
   - **Métrica afectada:** Accessibility.
   - **Causa raíz:** `--orange: #e85d2a` se usa como color de texto pequeño sobre fondos claros y como fondo de botones con texto blanco; además `.metric span` reduce el contraste con `opacity: .7`. El reporte señala elementos `.eyebrow`, etiquetas de métricas y botones. Véase [globals.css](../uis/backoffices/administrar_incidentes/app/globals.css#L2).
   - **Corrección propuesta:** separar los tokens de acento para texto y superficies; elegir pares de color con contraste WCAG AA para texto normal y retirar opacidad de etiquetas pequeñas. Verificar botones, métricas y etiquetas con las combinaciones reales de fondo.
   - **Origen de la recomendación:** análisis propio a partir del audit de contraste de Lighthouse.
   - **Estado:** aplicado en [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx); el grupo usa `fieldset`/`legend` y mantiene etiquetas individuales para los checkboxes.

5. **Problema:** el contenido de la aplicación está en español, pero el documento declara `lang="en"`.
      - **Corrección aplicada:** el root layout ahora declara `lang="es"`.
      - **Estado:** aplicada en [layout.tsx](../uis/backoffices/administrar_incidentes/app/layout.tsx#L12).
   - **Métrica afectada:** accesibilidad semántica y pronunciación en tecnologías de asistencia.
   - **Causa raíz:** atributo de idioma incorrecto en [layout.tsx](../uis/backoffices/administrar_incidentes/app/layout.tsx#L12).
   - **Corrección propuesta:** cambiar el idioma del documento a `es`.
   - **Origen de la recomendación:** análisis propio del código.
   - **Estado:** aplicado en [SupplierIdentity.tsx](../uis/backoffices/suppliers_tinydb/components/SupplierIdentity.tsx) e integrado en las vistas móvil y escritorio de [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx).

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
   - **Estado:** aplicado en [SupplierCategoryList.tsx](../uis/backoffices/suppliers_tinydb/components/SupplierCategoryList.tsx) e integrado en las vistas móvil y escritorio de [SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx).

2. **Dónde aparece:** el selector `.status-select` se repite para el resultado individual y cada fila del listado en [app/page.tsx](../uis/backoffices/administrar_incidentes/app/page.tsx#L70).
   - **Por qué es candidato:** duplica opciones, estilos y la acción de cambio de estado; es además el mismo tipo de control al que Lighthouse detectó falta de nombre accesible.
   - **Abstracción compartida propuesta:** `IncidentStatusSelect({ incident, onChange })` en `components/IncidentStatusSelect.tsx`, con nombre accesible contextual.
   - **Estado:** propuesta; requiere aprobación.

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
   - **Estado:** propuesta; requiere aprobación.

4. **Problema:** Lighthouse señala que un campo tiene varias etiquetas.
   - **Métrica afectada:** Accessibility; interpretación del nombre/agrupación del campo por tecnología asistiva.
   - **Causa raíz:** `FieldShell` devuelve un `<label>` ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L1037)) y el grupo “Categorías” lo usa como contenedor de las etiquetas `<label>` de cada checkbox ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L480)). El HTML anida etiquetas y provoca la asociación múltiple reportada.
   - **Corrección propuesta:** representar el grupo de categorías con `fieldset`/`legend` y mantener cada checkbox dentro de su propia etiqueta; conservar el texto de error y el estilo existente.
   - **Origen de la recomendación:** análisis propio del elemento fallido de Lighthouse.
   - **Estado:** propuesta; requiere aprobación.

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
   - **Estado:** propuesta; requiere aprobación.

2. **Dónde aparece:** las categorías del proveedor se recorren y se muestran con las mismas etiquetas y badges en la tarjeta móvil ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L696)) y en la tabla de escritorio ([SuppliersDashboard.tsx](../uis/backoffices/suppliers_tinydb/components/SuppliersDashboard.tsx#L826)).
   - **Por qué es candidato:** se repiten el mapeo de categorías y la presentación visual; una lista compartida reduciría divergencias entre vistas.
   - **Abstracción compartida propuesta:** `SupplierCategoryList({ categories, compact })` en `components/SupplierCategoryList.tsx`, con las etiquetas procedentes de `CATEGORY_LABELS`.
   - **Estado:** propuesta; requiere aprobación.

### 5. Evidencia de uso de la skill
- La skill `performance` indica que los cambios deben dirigirse a recursos o tareas identificados y desaconseja hints especulativos. Por ello, la cadena crítica y el chunk CSS quedan documentados, pero no se propone añadir `preconnect` ni modificar el CSS: no hay evidencia de bloqueo medible y Performance es 99.
- La skill distingue TBT de INP; TBT es 0 ms y no se aportó INP ni una tarea larga. No se propone reducir JavaScript sobre la base de este informe.
- La revisión de código sí permite vincular dos hallazgos de accesibilidad con controles concretos; se proponen cambios semánticos pequeños, sujetos a aprobación.

### 6. Validación de las correcciones
- Después de cada cambio: ESLint enfocado en los componentes afectados, `npx tsc --noEmit` y `npm run build`: correctos.
- La app no define un script de pruebas; no se ejecutaron pruebas automatizadas.
- Lighthouse no fue ejecutado por el agente. La medición posterior queda pendiente de una nueva medición del usuario.