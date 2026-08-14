# Propuesta de Arquitectura Backend para BRASALAND

## 1. Patrón arquitectónico elegido y su justificación

La propuesta es construir el backend de BRASALAND como un **monolito modular con arquitectura en capas**, usando FastAPI y SQLAlchemy. En la práctica, eso significa combinar dos criterios a la vez:

- **Separación por dominio** para que cada área del negocio tenga su propio módulo.
- **Separación por capa** dentro de cada dominio para que la lógica HTTP, la lógica de negocio y el acceso a datos no queden mezclados.

La estructura objetivo es:

- `routers` para exponer endpoints HTTP.
- `services` para coordinar reglas de negocio y casos de uso.
- `repositories` para encapsular consultas y escritura a base de datos.
- `models` para entidades persistentes y `schemas` para contratos de entrada/salida.

Esta elección encaja con BRASALAND por razones concretas del repo y del negocio:

1. **Hoy ya existe un dominio transversal, pero no existe persistencia.** En `src/types/models.ts` ya aparecen entidades como `MenuItem`, `SaleTransaction`, `Localizacion`, `WasteRecord` y `CountryMetrics`, y en `src/utils/transformations.ts` ya hay lógica de cálculo para ingresos, margen, ticket promedio, desperdicio, ranking de locaciones y comparación por país. Eso indica que el backend no parte de cero a nivel de dominio, pero sí parte de cero en infraestructura de datos. La arquitectura en capas permite mover esa lógica hacia servicios sin atarla desde el primer día a FastAPI o a SQLAlchemy.

2. **Los dominios críticos comparten información.** Productos, ventas y localidades están cruzados en el repo actual: una venta referencia `locationId`, `itemId`, método de pago, moneda y fecha; los cálculos de margen y desperdicio necesitan menú, ventas y waste records al mismo tiempo. Eso favorece un monolito modular antes que sistemas distribuidos. Separar en microservicios ahora agregaría complejidad operacional sin resolver un problema real del tamaño actual del equipo.

3. **Hay un solo desarrollador junior.** Un patrón simple, repetible y fácil de depurar vale más que uno teóricamente más flexible pero costoso de sostener. La arquitectura en capas es más fácil de enseñar, revisar y extender que alternativas como event-driven, CQRS o serverless fragmentado.

4. **Se espera crecimiento del equipo y del alcance.** La empresa ya opera en dos países, dos monedas y múltiples locaciones. Si el equipo crece, una estructura modular por dominio permite asignar áreas con menos choques. Si no crece todavía, sigue siendo suficientemente simple para una sola persona.

### Alternativas evaluadas y descartadas

**MVC clásico**

Puede funcionar en aplicaciones CRUD pequeñas, pero en BRASALAND hay reglas de negocio que cruzan varias entidades: margen por locación, comparación por país, validaciones multipaís, stock y desperdicio. Con MVC es más fácil que el modelo o el controller termine absorbiendo demasiada lógica y que los endpoints se vuelvan difíciles de testear.

**Serverless / funciones aisladas**

No es una buena primera base aquí. BRASALAND necesita consistencia entre productos, ventas, localidades y lealtad; además, el repo ya sugiere un dominio interconectado, no un conjunto de funciones independientes. Para un solo desarrollador, operar múltiples funciones, despliegues y configuraciones también complica más de lo que ayuda.

**Arquitectura hexagonal completa desde el día 1**

Es valiosa conceptualmente, pero para el contexto actual sería una sobrerregulación. La propuesta en capas ya introduce un límite claro entre FastAPI, reglas de negocio y persistencia. Si el sistema madura, esa base puede evolucionar hacia puertos/adaptadores sin rehacer todo.

### Decisión final

La recomendación es un **monolito modular en capas**. Es suficientemente simple para un desarrollador junior, suficientemente ordenado para que el equipo crezca, y suficientemente alineado con el dominio real que ya aparece en el repo.

## 2. Estructura de carpetas y módulos

El criterio recomendado es **dominio primero, capa después**. No conviene un único bloque global de `routers`, `services` y `repositories` con archivos gigantes, porque BRASALAND ya tiene varios dominios distintos. Tampoco conviene separar sólo por dominio sin capas, porque eso incentiva mezclar HTTP, SQL y reglas de negocio en un mismo archivo.

La estructura propuesta es esta:

```text
backend/
  app/
    main.py
    core/
      config.py
      database.py
      logging.py
      security.py
      cors.py
      exceptions.py
    api/
      router.py
      dependencies.py
      health.py
    domains/
      products/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      inventory/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      sales/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      locations/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      orders/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      customers/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      loyalty/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      payments/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      menus/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      waste/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      resources/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
      suppliers/
        router.py
        service.py
        repository.py
        models.py
        schemas.py
    shared/
      enums.py
      schemas.py
      pagination.py
      money.py
      time.py
      errors.py
    tests/
      domains/
      integration/
```

### Criterio de separación usado

La separación no es puramente técnica ni puramente funcional; es una combinación deliberada de ambas:

- **Por dominio** para que cada área del negocio tenga un límite reconocible: ventas, localidades, fidelización, menús, inventario, desperdicio.
- **Por responsabilidad interna** para que dentro de cada dominio se vea con claridad qué archivo expone HTTP, cuál resuelve reglas de negocio, cuál consulta la base y cuál define contratos o entidades.

En términos prácticos:

- `router.py` recibe requests, valida entrada HTTP y devuelve responses.
- `service.py` contiene casos de uso y reglas del negocio.
- `repository.py` encapsula consultas SQLAlchemy.
- `models.py` representa tablas y relaciones persistentes.
- `schemas.py` define DTOs de entrada/salida con Pydantic.

Ese criterio es adecuado para BRASALAND porque evita dos fallas comunes en equipos pequeños: crear archivos centrales gigantes y mezclar SQL, reglas y HTTP en la misma función.

### Por qué este criterio encaja con los dominios actuales

- **Productos y menús** no son exactamente lo mismo: el repo ya modela `MenuItem` con categoría, precio, costo de ingredientes, alérgenos, disponibilidad por país y estado. Eso sugiere un dominio de catálogo/menú, y otro de stock/inventario si luego se gestionan existencias separadas del menú publicado.
- **Ventas** es un dominio propio: `SaleTransaction` ya tiene identidad, timestamps, método de pago, camarero y locación.
- **Localidades** también es un dominio de primer nivel: `Localizacion` ya contiene capacidad, país, gerente, estado, costos fijos y dotación.
- **Waste records** merece módulo propio: no es sólo un atributo de ventas, sino un flujo operativo con responsable, costo, razón y fecha.
- **Loyalty y customers** deben estar separados aunque se relacionen. El formulario público hoy captura datos de registro del programa Brasa Points, no necesariamente un cliente transaccional completo. Conviene separar identidad del cliente de la cuenta de fidelización y sus movimientos de puntos.

### Coherencia con `src/types/` y `src/utils/`

Sí conviene mantener coherencia conceptual entre frontend y backend, pero no copiar la estructura tal cual.

- `src/types/models.ts` ya define un lenguaje de dominio útil: menú, ventas, locaciones, desperdicio, moneda, país, método de pago.
- `src/utils/transformations.ts`, `collections.ts`, `search.ts` y `businessValidations.ts` ya separan cálculo, filtrado, búsqueda y validación.

Esa convención sugiere que el equipo ya piensa en términos de dominio y utilidades. En backend conviene preservar **los mismos nombres conceptuales**, pero adaptarlos a Python:

- `Localizacion` debería normalizarse a `Location` o `LocationModel` en Python para evitar mezclar idiomas dentro del código del backend.
- `Country`, `PaymentMethod`, `WasteReason`, `MenuCategory` y estados deben vivir como `Enum` compartidos.
- Los cálculos hoy presentes en `transformations.ts` deben migrar a servicios de dominio, no a utilidades genéricas sin contexto.

### Dominios confirmados por el repo versus dominios inferidos del negocio

**Confirmados por código actual**

- Menús / productos
- Ventas
- Localidades
- Desperdicio / mermas
- Comparación por país / moneda
- Registro de Brasa Points

**Inferidos del contexto de negocio, pero aún no modelados en `src/types`**

- Pedidos
- Clientes / usuarios
- Pagos como entidad transaccional propia
- Stock / inventario
- Recursos internos
- Proveedores

El documento de arquitectura debe asumir ambos grupos, pero dejando claro que el primero tiene respaldo en el repo y el segundo todavía requiere definición de modelo.

### Contradicciones del repo que deben tratarse explícitamente

Hay varias inconsistencias que no conviene trasladar sin revisión al backend:

- El contexto corporativo habla de operación en Colombia y Florida, pero `src/test.ts` incluye una locación en Nueva York.
- El formulario público usa el valor `Estados Unidos`, mientras que `src/types/models.ts` usa `USA` para `Country`.
- Las ubicaciones públicas del formulario listan 14 restaurantes de Brasaland, pero los fixtures de `src/test.ts` usan nombres de `El Churrasco`, lo que parece dato de ejemplo y no catálogo real.

La recomendación es tratar `src/test.ts` como **fixture técnico no canónico**. La fuente de verdad del negocio debe salir de catálogos persistidos y enums normalizados en backend.

## 3. Organización de routers y endpoints de FastAPI

Los endpoints deben agruparse por dominio. El archivo agregador central sólo debe montar routers, no implementar lógica.

### Router de localidades

Prefijo sugerido: `/api/v1/locations`

- `GET /` listar locaciones con filtros por país, ciudad y estado.
- `GET /{location_id}` obtener detalle de una locación.
- `POST /` crear locación.
- `PATCH /{location_id}` actualizar datos operativos de la locación.
- `GET /{location_id}/performance` obtener métricas agregadas de rendimiento.
- `GET /comparison/by-country` obtener comparación Colombia vs. USA o Colombia vs. Estados Unidos según enum final.

Este router es prioritario porque productos, ventas, waste y recursos dependen de `location_id`.

### Router de productos

Prefijo sugerido: `/api/v1/products`

- `GET /` listar productos con filtros por categoría, estado y disponibilidad por país.
- `GET /{product_id}` obtener detalle del producto.
- `POST /` crear producto.
- `PATCH /{product_id}` actualizar precio base, costo de ingredientes, alérgenos o estado.
- `GET /top-selling` obtener productos más vendidos en un rango de fechas.

### Router de menús

Prefijo sugerido: `/api/v1/menus`

- `GET /` listar ítems visibles del menú.
- `GET /by-location/{location_id}` obtener menú habilitado para una locación.
- `POST /publish` publicar una versión de menú para un país o locación.
- `PATCH /items/{product_id}/availability` cambiar disponibilidad por país o locación.

La separación entre `products` y `menus` evita mezclar el catálogo maestro con la oferta publicada.

### Router de inventario / stock

Prefijo sugerido: `/api/v1/inventory`

- `GET /locations/{location_id}` listar stock por locación.
- `POST /movements` registrar entrada, ajuste o salida de stock.
- `GET /low-stock` listar alertas de stock bajo.
- `GET /products/{product_id}/availability` revisar disponibilidad operativa por locación.

El negocio menciona productos/stock como flujo crítico, así que este router debe existir desde la primera fase aunque el modelo exacto todavía no esté en el repo.

### Router de ventas

Prefijo sugerido: `/api/v1/sales`

- `GET /` listar transacciones con filtros por locación, fecha, país y método de pago.
- `GET /{sale_id}` obtener detalle de venta.
- `POST /` registrar venta.
- `GET /summary/daily` ingresos diarios por moneda.
- `GET /summary/average-ticket` ticket promedio.
- `GET /summary/payment-methods` distribución por método de pago.
- `GET /summary/location-margin/{location_id}` margen por locación.

Este router concentra lógica ya visible en `transformations.ts`, por lo que es uno de los primeros candidatos para backend real.

### Router de waste records

Prefijo sugerido: `/api/v1/waste-records`

- `GET /` listar mermas con filtros por locación, razón y rango de fechas.
- `GET /{record_id}` obtener detalle del registro.
- `POST /` registrar merma o desperdicio.
- `GET /summary/by-reason` agrupar desperdicio por razón.
- `GET /summary/cost-by-location/{location_id}` costo total de desperdicio por locación.

### Router de pedidos

Prefijo sugerido: `/api/v1/orders`

- `GET /` listar pedidos.
- `GET /{order_id}` obtener pedido.
- `POST /` crear pedido.
- `PATCH /{order_id}/status` actualizar estado.
- `GET /by-location/{location_id}` listar pedidos de una locación.

Aunque el sitio público actual todavía no ofrece pedidos online, el contexto de negocio deja claro que esa capacidad es esperada. El dominio debe diseñarse desde ahora, aunque salga en una fase posterior.

### Router de clientes / usuarios

Prefijo sugerido: `/api/v1/customers`

- `GET /` listar clientes.
- `GET /{customer_id}` obtener perfil del cliente.
- `POST /` crear cliente.
- `PATCH /{customer_id}` actualizar preferencias y datos de contacto.
- `GET /{customer_id}/orders` ver historial de pedidos.
- `GET /{customer_id}/locations` ver afinidad por locación.

Si luego hay autenticación para clientes, puede agregarse además un router separado de `auth`, pero no hace falta introducirlo como eje principal en este primer borrador.

### Router de fidelización

Prefijo sugerido: `/api/v1/loyalty`

- `POST /registrations` registrar alta en Brasa Points desde el formulario público.
- `GET /members/{member_id}` obtener estado de un miembro.
- `PATCH /members/{member_id}` actualizar datos del programa.
- `POST /points/accruals` acreditar puntos por compra.
- `POST /points/redemptions` canjear puntos.
- `GET /members/{member_id}/ledger` consultar historial de puntos.

Este dominio debe reflejar los campos ya presentes en la página pública: nombre, email, teléfono, país, ciudad, ubicación favorita, preferencias alimentarias, origen del lead, fecha de nacimiento, aceptación de términos y opt-in comercial.

### Router de pagos

Prefijo sugerido: `/api/v1/payments`

- `GET /` listar pagos.
- `GET /{payment_id}` obtener pago.
- `POST /` registrar pago asociado a pedido o venta.
- `PATCH /{payment_id}/status` actualizar estado del pago.
- `GET /summary/by-method` agregado por método de pago.

Aunque hoy `SaleTransaction` ya guarda `paymentMethod`, conviene separar pagos como dominio propio si se van a manejar estados, conciliación o reintentos.

### Router de recursos

Prefijo sugerido: `/api/v1/resources`

- `GET /` listar recursos internos por locación o tipo.
- `POST /` crear recurso.
- `PATCH /{resource_id}` actualizar estado o asignación.
- `GET /by-location/{location_id}` recursos asociados a una locación.

Aquí pueden caer inicialmente activos operativos, materiales internos o recursos de soporte. El negocio lo menciona, pero el repo todavía no lo define con precisión.

### Router de proveedores

Prefijo sugerido: `/api/v1/suppliers`

- `GET /` listar proveedores.
- `GET /{supplier_id}` obtener detalle.
- `POST /` crear proveedor.
- `PATCH /{supplier_id}` actualizar datos y condiciones.
- `GET /price-history` consultar histórico de precios.

El contexto corporativo menciona compras y proveedores como área relevante. Aunque no estaba en la lista mínima del usuario, sí aparece en el repo contextual y conviene reservarle módulo.

## 4. Convenciones estándar de FastAPI

La convención base recomendada viene de la guía oficial de FastAPI para **aplicaciones grandes**, especialmente el patrón de **Bigger Applications - Multiple Files**, que promueve separar routers con `APIRouter`, centralizar dependencias y mantener un `main.py` pequeño.

También influye la documentación oficial de FastAPI sobre:

- **Body - Nested Models / Request body** para separar con claridad los contratos de entrada y salida.
- **Dependencies** para inyectar sesión de base de datos, configuración y validaciones transversales.
- **SQL Databases** para la convivencia entre FastAPI, modelos ORM y esquemas de validación.

No se replica literalmente la estructura de los ejemplos oficiales, pero sí se toma su criterio central: una aplicación FastAPI mediana o grande se organiza en múltiples módulos, con routers desacoplados, dependencias reutilizables y una distinción clara entre capa web, validación y persistencia.

### Convenciones adoptadas

**Routers separados con `APIRouter`**

Cada dominio debe tener su propio router y el archivo principal sólo debe incluirlos en un agregador central. Eso reduce acoplamiento y hace que la documentación OpenAPI quede ordenada por tags.

**Separación entre schemas Pydantic y modelos ORM**

- `schemas.py` para request/response validation con Pydantic.
- `models.py` para entidades de SQLAlchemy.

No conviene reutilizar directamente modelos ORM como contratos HTTP. Esa práctica termina filtrando detalles de persistencia al API y dificulta evolución del esquema.

**Dependencias explícitas**

FastAPI favorece el uso de `Depends`. En BRASALAND eso debería usarse al menos para:

- sesión de base de datos por request;
- configuración cargada desde entorno;
- validación de contexto de locación o país cuando aplique;
- autenticación futura para backoffice o procesos internos.

**Configuración centralizada**

Variables de entorno, URLs de base de datos, claves, configuración CORS y modo de ejecución deben vivir en `core/config.py`, no repartidas entre routers.

**Manejo consistente de errores**

Los routers no deberían construir respuestas de error ad hoc. La validación de negocio debe elevar excepciones de dominio manejadas de forma central, y FastAPI debe traducirlas a respuestas HTTP coherentes.

**Archivo raíz liviano**

`main.py` no debería contener lógica de negocio ni consultas. Su responsabilidad debería limitarse a:

- crear la app FastAPI;
- cargar configuración;
- registrar middlewares y CORS;
- incluir el router principal.

Eso sigue directamente la convención recomendada en la guía oficial para aplicaciones grandes y ayuda a que el punto de entrada no se convierta en un archivo monolítico difícil de mantener.

### Cómo influyen estas convenciones en la decisión arquitectónica

Estas convenciones refuerzan la elección de un monolito modular en capas porque:

- FastAPI ya trabaja naturalmente con routers separados.
- La separación `schemas` vs. `models` encaja con la capa service/repository.
- Las dependencias inyectadas ayudan a evitar que un router cree sesiones SQLAlchemy o lógica de configuración por su cuenta.

En otras palabras: la forma recomendada por FastAPI para aplicaciones grandes ya empuja a una arquitectura ordenada; no hace falta inventar una convención propia más compleja.

## 5. Frontend y backend como sistemas separados

Aunque frontend y backend convivan en el mismo monorepo, deben tratarse como **dos sistemas desplegables y ejecutables distintos**.

Eso implica algo importante para la arquitectura: compartir repositorio no significa compartir proceso, configuración ni responsabilidades. El frontend no debe asumir detalles internos de SQLAlchemy o de la base de datos, y el backend no debe depender de componentes de UI para funcionar.

### Implicancias operativas

**Comunicación por API REST**

- El frontend corporativo y cualquier backoffice deben consumir el backend exclusivamente por HTTP.
- No debe haber acceso directo del frontend a la base de datos.
- Los contratos del backend deben quedar versionados, por ejemplo bajo `/api/v1`.
- La API debe ser el único punto formal de integración entre ambos sistemas, incluso si están en el mismo repositorio.

**Variables de entorno separadas**

El frontend necesita al menos:

- URL base de la API;
- flags de entorno si cambia entre local, staging y producción.

El backend necesita al menos:

- cadena de conexión a base de datos;
- secretos o claves internas;
- allowlist de orígenes CORS;
- configuración de logging y modo de ejecución.

Los secretos del backend no deben vivir en el código del frontend ni compartirse por conveniencia dentro del monorepo.

**CORS**

Como el frontend y la API corren como servicios distintos, el backend debe declarar explícitamente los orígenes permitidos. Eso aplica tanto al sitio público como a futuros backoffices. La política debe ser restrictiva por entorno y no usar comodines en producción.

### Monorepo versus repos separados

Desde la práctica habitual en aplicaciones web separadas, hay dos modelos razonables:

- **Monorepo**: frontend y backend viven juntos, pero con carpetas, pipelines y variables propias.
- **Repos separados**: cada sistema evoluciona en su propio repositorio y se integra por contratos de API.

En BRASALAND, el monorepo tiene mejor encaje hoy porque el equipo es pequeño, el dominio todavía se está estabilizando y conviene que frontend, backend y documentación evolucionen cerca. Sin embargo, la disciplina arquitectónica debe ser la misma que en repos separados: contratos explícitos, configuración aislada y despliegues independientes.

### Monorepo: mantenerlo o separarlo más adelante

**Recomendación actual: mantener el monorepo.**

Para BRASALAND hoy tiene más ventajas que costos:

- un solo desarrollador maneja menos repositorios;
- el contexto de negocio y los contratos frontend/backend quedan juntos;
- es más fácil compartir documentación, tipos conceptuales y decisiones de arquitectura;
- el proyecto todavía está en una fase de construcción de base, no de escalado organizacional.

**Argumentos en contra a mediano plazo**

- si el equipo crece mucho, puede aumentar el ruido en pull requests y pipelines;
- si frontend y backend empiezan a tener ciclos de despliegue muy diferentes, el repo único puede incomodar;
- si aparecen equipos separados por producto o país, un corte posterior puede tener sentido.

**Qué ganaría BRASALAND con repos separados en ese escenario futuro**

- ownership más claro por equipo;
- pipelines más específicos por stack;
- menor acoplamiento operativo entre cambios de UI y cambios de API.

**Qué perdería si se separa demasiado pronto**

- más fricción para un único desarrollador;
- más coordinación manual para cambios de contrato;
- mayor riesgo de desalineación entre documentación, frontend y backend al inicio.

**Conclusión práctica**

Para el estado actual de BRASALAND, el monorepo sigue siendo la mejor opción. La separación importante hoy no es de repositorio, sino de **límites de ejecución, configuración y responsabilidades**.

## 6. Riesgos y puntos de atención

### Riesgo 1: lógica de negocio filtrada a los routers

Si los routers empiezan a calcular márgenes, validar reglas de fidelización o decidir cómo comparar países, el backend va a quedar difícil de testear y muy acoplado a HTTP. En BRASALAND eso afectaría directamente los flujos críticos de productos, ventas y localidades, porque la misma lógica podría terminar duplicada entre endpoints distintos.

### Riesgo 2: acoplar persistencia directamente a FastAPI

Si cada endpoint construye consultas SQLAlchemy por su cuenta, desaparece el límite entre API y acceso a datos. El resultado típico es inconsistencia en filtros, validaciones repetidas y errores sutiles entre locaciones o monedas. Para un negocio multipaís, ese riesgo es alto.

### Riesgo 3: no normalizar catálogos compartidos

El repo ya muestra inconsistencias entre `USA` y `Estados Unidos`, y entre fixtures de prueba y catálogos públicos. Si eso entra sin control a la base de datos, después será muy difícil consolidar reportes por país, disponibilidad de menú, puntos o ventas por locación.

### Riesgo 4: mezclar catálogo de menú con stock operativo

Un `MenuItem` no equivale automáticamente a existencia de stock. Si el equipo usa una sola tabla o un solo módulo para ambas cosas, terminará forzando reglas operativas equivocadas: por ejemplo, un producto puede existir en catálogo pero no estar disponible en una locación concreta por falta de inventario.

### Riesgo 5: diseñar pedidos, pagos y fidelización como campos sueltos dentro de ventas

El repo actual ya modela `paymentMethod` dentro de la venta, lo cual sirve para ejemplos, pero en un backend real pagos, pedidos y puntos acumulan estado propio. Si todo queda embebido en una sola entidad de ventas, la evolución futura será costosa.

## Cierre

El backend de BRASALAND debería arrancar como un **monolito modular en capas**, con prioridad inicial en **localidades, productos/menú, ventas y waste records**, porque son los dominios mejor respaldados por el repo y también los más críticos para la operación. Sobre esa base conviene incorporar después clientes, fidelización, pedidos, pagos, inventario, recursos y proveedores, manteniendo siempre contratos HTTP claros, servicios de negocio explícitos y acceso a datos encapsulado.