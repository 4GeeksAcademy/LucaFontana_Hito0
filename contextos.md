# BRIEFING — Brasaland · Hito 3: Talent Pipeline Tracker

> **Ruta en el repositorio:** `03-talent-pipeline-tracker/brasaland-BRIEFING.md`

---

## Tu empresa

Eres parte del equipo **Brasaland Digital**, la unidad tecnológica interna de Brasaland, una cadena de restaurantes de parrilla con 14 locales en Colombia y Florida. Tu trabajo es construir las herramientas que los equipos operativos usarán en el día a día.

---

## El encargo

Ashley Turner, People Manager, ha enviado el siguiente correo con copia a Nicolás Park, CTO:

> **Para:** Nicolás Park (CTO)
> **CC:** Equipo Brasaland Digital
> **Asunto:** URGENTE — Necesitamos la herramienta de selección esta semana
>
> Nicolás,
>
> Te escribo porque ya no podemos seguir gestionando el proceso de selección del **Asistente de Dirección** en una hoja de Google Sheets. Llevamos más de cien candidaturas y tres personas editando el mismo archivo a la vez. Esta mañana hemos perdido los datos de dos candidatos por un error al guardar.
>
> Entiendo que el backend ya está listo. Necesito que alguien del equipo monte el frontend esta semana, no puede esperar más.
>
> Lo que necesito que haga la herramienta:
>
> - Ver todas las candidaturas de un vistazo: nombre, puesto, estado y etapa.
> - Filtrar por estado y etapa, y buscar por nombre o email sin recargar la página.
> - Entrar al detalle de cada candidato y poder cambiarle el estado o la etapa desde ahí.
> - Apuntar notas internas después de cada llamada o entrevista, y borrarlas si ya no sirven.
> - Registrar candidatos que llegan por otras vías y corregir datos cuando vienen mal.
>
> Gracias por escalarlo.
>
> Ashley


---

# BRIEFING — Utilidad de Análisis de Datos: Procesador de Reportes de Incidentes

## Empresa: Brasaland

---

## Tu empresa

**Brasaland** es una cadena de restaurantes de comida a la parrilla con 14 sedes entre Colombia y Florida (EE. UU.). Formas parte del equipo interno **Brasaland Digital**, trabajando bajo la dirección de **Nicolás Park (CTO)** y en coordinación cercana con **Felipe Guerrero (Director de Operaciones)**.

El departamento de Operaciones registra cada incidente operativo que ocurre en la cadena: fallas de equipos, problemas de abastecimiento, quejas de clientes, incidentes de calidad de alimentos y situaciones relacionadas con personal. Hasta ahora, cada gerente de sede registraba incidentes en una hoja de cálculo compartida. Esa hoja se exportó a CSV y tu archivo de prueba tiene **1,000 filas** que representan un mes de historial en las 14 sedes.

El objetivo de tu script es validar y resumir estos datos antes de que se usen como base del dashboard operativo en tiempo real que reemplazará por completo la hoja de cálculo.

---

# BRIEFING — Directorio de Proveedores · Brasaland

_These instructions are also available in [English](./brasaland-BRIEFING.en.md)._

> **Milestone:** 09 — Lightweight Storage API  
> **Ruta en el repositorio:** `09-lightweight-storage/brasaland-BRIEFING.md`

---

## Tu empresa

Eres parte del equipo **Brasaland Digital**, la unidad tecnológica interna de Brasaland, una cadena de restaurantes de comida a la brasa con **14 locales** en Colombia y Florida. Tu tech lead es **Nicolás Park**, CTO, y quien ha solicitado este proyecto es **Lucía Fernández**, Procurement Manager.

Brasaland trabaja con alrededor de **20 proveedores activos** distribuidos entre Colombia y Florida. Hasta ahora, Lucía gestiona el directorio en una hoja de cálculo compartida por correo. Cada vez que cambia la tarifa de un proveedor o hay que incorporar uno nuevo, hay tres versiones del fichero en circulación y nadie sabe cuál es la oficial. Este proyecto crea la fuente de verdad única.

---

# BRIEFING — Gestor de Incidencias Centralizado · Brasaland

## Tu empresa

**Brasaland** es una cadena de restaurantes de comida a la brasa con **14 locales** operando en Colombia y Florida (EE.UU.). Empleas a unas 115 personas entre personal de cocina y sala, supervisores de operaciones y el equipo corporativo de Medellín, con oficina comercial en Miami.

Como parte del equipo de **Brasaland Digital**, llevas hitos construyendo la plataforma interna de la empresa. Este proyecto integra en esa plataforma un gestor centralizado de incidencias, para que cualquier sede pueda reportar problemas operativos, de cliente o internos — y el equipo de operaciones pueda hacer seguimiento desde un único panel.

---

## Quién lo usa y por qué

**Felipe Guerrero (Director de Operaciones)** necesita saber qué está pasando en cada local sin tener que llamar a cada gerente. Hoy recibe reportes por WhatsApp o al final de la semana. Con este gestor, cualquier incidencia queda registrada al momento, categorizada y asignada a una sede.

**Mariana Restrepo (CEO)** quiere ver en el panel ejecutivo cuántas incidencias hay abiertas esta semana, de qué tipo y en qué locales. Hasta ahora eso no existe.

El formulario lo usarán **gerentes de local** (desde tablet en cocina o sala) y el **equipo de central** (desde escritorio en Medellín o Miami).

## Notas de implementación

- El formulario lo usarán gerentes de local desde dispositivos táctiles: los campos deben ser suficientemente grandes y el desplegable de sede debe mostrar el nombre legible (`Medellín Centro`), no el valor interno (`medellin_centro`).
- Los mensajes de error deben estar en el idioma base elegido para la aplicación. Si has implementado soporte bilingüe en hitos anteriores, mantén esa lógica.
- Las incidencias de tipo `customer_complaint` con estado `open` durante más de 48 horas son prioritarias para Felipe — aunque la alerta automática no es parte de este proyecto, diseña el modelo de datos pensando en que ese filtro deberá ser fácil de implementar más adelante.

---

# BRIEFING — Hito 5: Gestión de Inventario Backend
## Empresa: Brasaland

**Ruta:** `05-backend-inventory-orm/brasaland-BRIEFING.es.md`

---

## Tu Empresa

**Brasaland** es una cadena de restaurantes de cocina a la brasa con 14 locales repartidos entre Colombia y Florida. La empresa procesa cientos de órdenes de ingredientes cada semana: carne, verduras, salsas, bebidas, envases y productos de limpieza llegan de unos 20 proveedores en ambos países, y esos mismos ingredientes salen de cada cocina cada día durante la preparación y — inevitablemente — en forma de merma.

Hasta ahora, el stock de ingredientes en cada local lo ha gestionado el encargado local por WhatsApp y hojas de cálculo. **Nicolás Park (CTO)** ha asignado a tu equipo la construcción de la capa centralizada de gestión de inventario de la plataforma Brasaland Digital. Es la primera vez que Brasaland tendrá una única fuente de verdad sobre qué hay en stock en toda la cadena.

> **De Nicolás (CTO) — Ticket Notion #BRD-0512:**
> "El equipo de operaciones está ciego con los ingredientes. Los supervisores de Felipe no saben cuánta carne hay disponible en Miami hasta que llaman a la cocina. Construid la API de inventario. Las entradas de ingredientes vienen de entregas de proveedores; las salidas vienen de registros de consumo e informes de merma. El stock debe ser de solo lectura — siempre es el neto de lo que llegó menos lo que se usó. Todos los endpoints bajo `/inventory`. Consultad la especificación de entidades a continuación."

