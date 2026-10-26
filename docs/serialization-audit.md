# Auditoría de serialización del backend

## Resumen global

| Servicio | Nº de endpoints | ✅ | ⚠️ | ❌ | Estado de la auditoría |
|---|---:|---:|---:|---:|---|
| `services/JWTauth_api` | 12 | 12 | 0 | 0 | Completada |
| `services/manage_incidentsAPI` | 6 | 6 | 0 | 0 | Completada |
| `services/suppliers_api` | 12 | 12 | 0 | 0 | Completada |
| `services/inventory_management_API` | 11 | 11 | 0 | 0 | Completada |
| `services/api` + `services/incidents` | 3 | 3 | 0 | 0 | Completada |

Clasificación original de `services/JWTauth_api`: **7 ✅, 1 ⚠️ y 4 ❌**.

## Criterios de clasificación

- ✅ **Ya serializado**: la ruta declara un `response_model` explícito y su esquema representa una respuesta segura y adecuada.
- ⚠️ **Parcialmente serializado**: declara un `response_model`, pero la forma de salida o los campos expuestos no cumplen el contrato necesario.
- ❌ **No serializado**: no declara un `response_model` explícito o devuelve una estructura sin esquema de respuesta.

## Servicio: `services/JWTauth_api`

### Contexto técnico

- **Framework y librerías**: FastAPI 0.141.1; Pydantic 2.13.4 (sintaxis v2); TinyDB 4.9.0; Passlib 1.7.4; bcrypt instalado 5.0.0; python-jose 3.5.0. `pyproject.toml` declara FastAPI `>=0.141.1`, pero no fija Pydantic; declara bcrypt `<4.1`.
- **Ejecución**: mixta. `login` y `forgot_password` son `async`; el resto de las rutas es síncrono.
- **Persistencia**: TinyDB con tablas de usuarios, perfiles y tokens de recuperación; no usa SQLAlchemy.
- **Estructura**: rutas en `auth.py`, `users.py` y `profiles.py`; modelos de entrada y salida junto a sus rutas; pruebas en `services/JWTauth_api/tests/`.
- **Consumidores**: inventario (`uis/backoffices/administrar_inventario`), proveedores (`uis/backoffices/suppliers_tinydb`) y el frontend autenticado de incidentes (`uis/backoffices/analizador_incidentes`). El directorio `administrar_incidentes` también existe y consume `manage_incidentsAPI`.
- **Campos observados en frontends**: inventario muestra `user.email`; proveedores e incidentes muestran `user.email` y leen `user.profile.name`, `phone` y `address`. El tipo compartido `AuthUser` declara además `id`, `is_active`, `role`, `created_at`, `profile.id` y `profile.user_id`. Los flujos de registro esperan el fin de la solicitud, pero no leen su cuerpo.
- **Otros endpoints de usuarios**: ningún frontend examinado llama a `GET /users`, `GET /users/{id}`, `PUT /users/{id}` o `DELETE /users/{id}`. Se conserva su representación pública existente para no cambiar el contrato disponible a otros clientes; no se ha identificado a esos posibles clientes.
- **Línea base**: `pytest -q` no pudo iniciar porque la configuración activa `pytest-cov` y el plugin no está disponible. Con `pytest -q -o addopts=''`: **11 passed, 3 failed, 14 errors**. Los fallos y errores existentes se producen al crear/verificar contraseñas: el entorno tiene bcrypt 5.0.0, incompatible con la restricción `<4.1` declarada por el servicio. No se atribuyen a cambios de serialización.

### Endpoints de autenticación

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/auth/login` | POST | Iniciar sesión | `OAuth2PasswordRequestForm`: `username`, `password` | `TokenResponse` | ✅ | `access_token`, `token_type` | Contraseña, hash, email | `TokenResponse`: `access_token`, `token_type` | No aplica | Ninguno; salida ya explícita y sin email | ✅ |
| `/auth/forgot-password` | POST | Solicitar recuperación | `ForgotPasswordPayload`: `email` | `dict[str, str]` con mensaje genérico | ❌ | El cliente solo espera el resultado; no lee campos | Email, token de recuperación, hash del token | `MessageResponse`: `message` genérico | No aplica | Añadidos `response_model=MessageResponse` y retorno tipado | ✅ |
| `/auth/reset-password` | POST | Restablecer contraseña | `ResetPasswordPayload`: `token`, `new_password` | `dict[str, str]` con mensaje | ❌ | El cliente solo espera el resultado | Token, contraseña, hash | `MessageResponse`: `message` | No aplica | Añadidos `response_model=MessageResponse` y retorno tipado | ✅ |
| `/auth/change-password` | POST | Cambiar contraseña autenticado | `ChangePasswordPayload`: `current_password`, `new_password` | `dict[str, str]` con mensaje | ❌ | El cliente solo espera el resultado | Contraseñas, hash, tokens | `MessageResponse`: `message` | No aplica | Añadidos `response_model=MessageResponse` y retorno tipado | ✅ |
| `/auth/me` | GET | Consultar el usuario autenticado | Bearer token | `AuthenticatedUserResponse` | ✅ | `email`; proveedores e incidentes también leen `profile.name`, `profile.phone`, `profile.address` | Hash de contraseña y tokens internos | `id`, `email`, `is_active`, `role`, `created_at`, `profile` (`id`, `user_id`, `name`, `phone`, `address`) | Perfil anidado: los dos consumidores de perfil leen sus campos; se conservan `id` y `user_id` también declarados por el tipo compartido `AuthUser` | Ninguno; la ruta autenticada puede incluir el email propio | ✅ |
| `/users` (registro) | POST | Registrar usuario y perfil | `UserCreateRequest`: `email`, `password`, `name`, `phone`, `address` | `UserWithProfileResponse`; incluye el email y el perfil aunque el cliente no lee el cuerpo | ⚠️ | El flujo de registro no consume campos de respuesta | Email en la respuesta de registro; contraseña, hash y tokens | `UserCreateResponse`: `id` solamente | Sin relación en la confirmación | Añadido `UserCreateResponse`; la confirmación devuelve solo `id` | ✅ |

### Resto de endpoints

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/users` | GET | Listar usuarios | Bearer token | `list[UserResponse]` | ✅ | Sin consumidor frontend localizado | Hash, contraseña y tokens | Lista de `UserResponse`: `id`, `email`, `is_active`, `role`, `created_at` | Sin relación; la lista ya es plana | Ninguno; se conserva el contrato público existente | ✅ |
| `/users/{id}` | GET | Consultar usuario y perfil | `id` de ruta; Bearer token | `UserWithProfileResponse` | ✅ | Sin consumidor frontend localizado | Hash, contraseña y tokens | Usuario: `id`, `email`, `is_active`, `role`, `created_at`; perfil: `id`, `user_id`, `name`, `phone`, `address` | Perfil anidado; la ruta de detalle ya entrega el perfil separado y no incluye otros documentos | Ninguno; se conserva el contrato público existente | ✅ |
| `/users/{id}` | PUT | Actualizar email o rol | `UserUpdateRequest`: `email`, `role`; Bearer token | `UserResponse` | ✅ | Sin consumidor frontend localizado | Hash, contraseña y tokens; `role` solo se modifica con permiso de administrador | `UserResponse`: `id`, `email`, `is_active`, `role`, `created_at` | Sin relación | Ninguno; entrada separada de salida | ✅ |
| `/users/{id}` | DELETE | Eliminar usuario y perfil | `id` de ruta; Bearer token | `dict[str, str]` con `detail` | ❌ | Sin consumidor frontend localizado | Hash, contraseña y tokens | `UserDeleteResponse`: `detail` | Se elimina el perfil asociado; no se devuelve el documento relacionado | Añadidos `response_model=UserDeleteResponse` y retorno tipado | ✅ |
| `/profiles/me` | GET | Consultar perfil propio | Bearer token | `ProfileResponse` | ✅ | `name`, `phone`, `address` | Hash, tokens y datos de otras cuentas | `ProfileResponse`: `id`, `user_id`, `name`, `phone`, `address` | Perfil propio como objeto plano; el tipo compartido declara sus identificadores | Ninguno | ✅ |
| `/profiles/me` | PUT | Actualizar perfil propio | `ProfileUpdateRequest`: `name`, `phone`, `address`; Bearer token | `ProfileResponse` | ✅ | `name`, `phone`, `address` | Campos no editables (`id`, `user_id`), hash y tokens | `ProfileResponse`: `id`, `user_id`, `name`, `phone`, `address` | Objeto plano; se conserva el contrato de `Profile` compartido | Ninguno; entrada separada de salida | ✅ |

### Detalle por endpoint que requiere trabajo

- **`POST /auth/forgot-password`**: la ruta ya genera un mensaje neutral y no confirma si el email existe, pero la respuesta es un diccionario sin modelo. Se tipará como `MessageResponse(message)`; no se devolverán email, token ni hash.
- **`POST /auth/reset-password`**: el diccionario de confirmación carece de esquema. Se tipará como `MessageResponse(message)`; token y contraseña solo pertenecen a la solicitud.
- **`POST /auth/change-password`**: el diccionario de confirmación carece de esquema. Se tipará como `MessageResponse(message)`; las contraseñas y los hashes no se incluirán.
- **`POST /users` (registro)**: el modelo existente expone el email en un flujo no autenticado y devuelve un perfil innecesario para el cliente. Se sustituirá por `UserCreateResponse(id)`. El esquema de entrada seguirá aceptando solo email, contraseña y campos de perfil escribibles; valores extra como `id`, `role` o `created_at` no se asignan desde el cliente.
- **`DELETE /users/{id}`**: devuelve un diccionario sin modelo. Se tipará como `UserDeleteResponse(detail)`, sin cambiar el código HTTP ni el mensaje.

### Cambios en esquemas de entrada (endpoints de escritura)

Los esquemas de entrada existentes se mantienen separados de los de salida: `UserCreateRequest`, `UserUpdateRequest`, `ProfileUpdateRequest`, `LoginFormPayload`, `ForgotPasswordPayload`, `ResetPasswordPayload` y `ChangePasswordPayload`. `POST /users` continúa asignando el rol `user` en el servidor; los campos adicionales enviados por el cliente se ignoran por la configuración actual de Pydantic. No se modifica la lógica de autorización ni el comportamiento de los endpoints.

### Pruebas añadidas y resultados

Se añadieron 10 pruebas en `tests/test_serialization.py`: formas de respuesta de autenticación, registro, borrado y listado; filtrado de credenciales y tokens; campos extra no escribibles; y presencia de `response_model` en las 12 rutas.

- **Línea base** (`pytest -q -o addopts=''`): 11 pasaron, 3 fallaron, 14 dieron error.
- **Verificación enfocada** (`pytest -q -o addopts='' tests/test_serialization.py`): 10 pasaron.
- **Resultado final** (`pytest -q -o addopts=''`): 21 pasaron, 3 fallaron, 14 dieron error. Los mismos 3 fallos y 14 errores de la línea base permanecen por el bcrypt 5.0.0 del entorno; no hubo regresiones entre las pruebas que pasaban en la línea base.
- El comando sin `-o addopts=''` no pudo iniciar porque no está instalado el plugin `pytest-cov` configurado en `pyproject.toml`.

### Verificación manual en `/docs`

**Estado: pendiente de confirmación del usuario.** Tras iniciar la API y obtener un token con `POST /auth/login`, comprobar:

1. **Lista — `GET /users`**: enviar `Authorization: Bearer <access_token>`. Esperado: una lista con `id`, `email`, `is_active`, `role` y `created_at`. No deben aparecer `password`, `hashed_password` ni tokens internos.
2. **Escritura — `POST /users`**: enviar `{"email":"nuevo@example.com","password":"ClaveSegura123","name":"Nuevo usuario","phone":"555-0100","address":"Calle 1"}`. Esperado: HTTP 201 y `{"id": <entero>}`. No deben aparecer email, password, hash ni perfil.
3. **Recuperación — `POST /auth/forgot-password`**: enviar `{"email":"usuario@example.com"}`. Esperado: HTTP 200 y un único campo `message` genérico; no deben aparecer email, token ni hash de token.
4. **Usuario actual — `GET /auth/me`**: enviar `Authorization: Bearer <access_token>`. Esperado: `id`, `email`, `is_active`, `role`, `created_at` y `profile`; el perfil puede contener `id`, `user_id`, `name`, `phone` y `address`. No deben aparecer contraseña, hash ni tokens internos.

### Hallazgos, riesgos y preguntas abiertas

- El directorio `uis/backoffices/administrar_incidentes` sí existe y es el consumidor de `manage_incidentsAPI`; el flujo de autenticación examinado para `JWTauth_api` está en `uis/backoffices/analizador_incidentes`.
- No se encontraron llamadas frontend a los endpoints CRUD de usuarios. Se conserva su respuesta segura ya existente para no romper posibles clientes no identificados.
- El entorno de prueba instala bcrypt 5.0.0 aunque el servicio declara `<4.1`; la línea base no está verde. Se deja esta incompatibilidad preexistente fuera del alcance de serialización.
- El campo `email` se mantiene en `/auth/me` porque las pantallas de inventario, proveedores e incidentes lo muestran. Los campos `id` y `user_id` del perfil se mantienen porque el tipo compartido `AuthUser` los declara.

## Servicio: `services/manage_incidentsAPI`

### Contexto técnico

- **Framework y librerías**: FastAPI 0.141.1; Pydantic 2.13.4 (sintaxis v2); TinyDB 4.9.0. `requirements.txt` declara FastAPI `>=0.116,<1.0` y TinyDB `>=4.8,<5.0`; no declara SQLAlchemy ni una dependencia de pruebas.
- **Ejecución**: rutas síncronas; el manejador global de errores es asíncrono.
- **Persistencia**: TinyDB; `get_incidents()` entrega copias de documentos como diccionarios.
- **Estructura**: seis rutas en `main.py`; almacenamiento en `database.py`; validadores y valores canónicos en `packages/shared/validators.py` y `packages/shared/constants.py`.
- **Frontend consumidor**: `uis/backoffices/administrar_incidentes`. Consulta la API directamente y consume la lista, el resumen por estado, la creación, el detalle y los cambios de estado.
- **Campos usados en la UI**: `IncidentRow` renderiza `id`, `title`, `category`, `branch` y `status`; los tipos `Incident` y `Summary` del frontend además declaran `description`, `origin`, `created_at` y los cuatro grupos de conteos. La vista del resumen lee `by_status` (incluidos `open`, `in_progress` y `resolved`) y suma sus valores.
- **Pruebas base**: `pytest -q services/manage_incidentsAPI` terminó con código 5 (`no tests ran`). No hay pruebas Python existentes en el servicio ni casos Python relevantes en `/tests`.
- **Clasificación original**: 0 ✅, 0 ⚠️ y 6 ❌. Las seis rutas no declaran un esquema de respuesta Pydantic; varias establecen explícitamente `response_model=None`.

### Endpoints de autenticación

Este servicio no registra endpoints de autenticación.

### Resto de endpoints

#### Tabla de auditoría

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/health` | GET | Comprobar disponibilidad | Ninguna | `dict[str, str]` (`status`) | ❌ | `status` | Ninguno | `HealthResponse`: `status` | No aplica | Añadidos `response_model=HealthResponse` y retorno tipado | ✅ |
| `/api/incidents` | POST | Crear incidente | `dict[str, Any]`; el validador requiere `title`, `description`, `category`, `origin` y `branch`; `status` opcional solo se valida, pero la creación siempre fija `open` | Documento completo: `id`, `title`, `description`, `category`, `status`, `origin`, `branch`, `created_at`, `updated_at`; validación 400 con `detail` y `errors` | ❌ | El cliente ignora el cuerpo de confirmación | `updated_at` (timestamp de auditoría); el cliente no puede establecer `id` ni timestamps | `IncidentCreatedResponse`: `id` | No hay relaciones | Añadidos `IncidentCreateRequest`, `IncidentCreatedResponse` y esquema de error 400; el estado inicial sigue siendo `open` | ✅ |
| `/api/incidents` | GET | Listar y filtrar incidentes | Query opcional: `status`, `origin`, `branch`, `category` | Lista de documentos TinyDB sin proyección; validación 400 con `detail` y `errors` | ❌ | `id`, `title`, `category`, `branch`, `status`; el tipo frontend conserva además `description`, `origin` y `created_at` | `updated_at` y campos no incluidos en el contrato de incidente | `list[IncidentResponse]`: `id`, `title`, `description`, `category`, `status`, `origin`, `branch`, `created_at` | Sin relaciones | Añadidos modelo de elemento/lista y esquema de error 400; se excluye `updated_at` | ✅ |
| `/api/incidents/summary` | GET | Contar incidentes por dimensión | Ninguna | Diccionario genérico con `by_status`, `by_category`, `by_origin`, `by_branch` | ❌ | La vista usa `by_status`; el tipo frontend declara los cuatro grupos | Ninguno | `IncidentSummaryResponse`: los cuatro grupos con sus claves canónicas y conteos enteros | No aplica | Añadidos modelos tipados para los grupos y el resumen; se conserva la forma publicada | ✅ |
| `/api/incidents/{incident_id}` | GET | Buscar incidente por ID | `incident_id` de ruta | Documento TinyDB sin proyección o `{"detail": "Incident not found"}` (404) | ❌ | `id`, `title`, `category`, `branch`, `status`; el tipo frontend también declara `description`, `origin`, `created_at` | `updated_at` y campos no incluidos en el contrato de incidente | `IncidentResponse`: `id`, `title`, `description`, `category`, `status`, `origin`, `branch`, `created_at`; error tipado `detail` | Sin relaciones | Añadidos modelos de éxito/error y esquema 404 | ✅ |
| `/api/incidents/{incident_id}/status` | PATCH | Cambiar estado con transición validada | `dict[str, Any]`; el validador usa `status` | Documento actualizado completo o error JSON 400/404 | ❌ | El cliente envía `status`; actualiza su estado local de forma optimista y no lee el cuerpo de confirmación | `updated_at` y campos no necesarios para confirmar el cambio | `IncidentStatusResponse`: `id`, `status`; errores tipados `detail` o `detail` + `errors` | Sin relaciones | Añadidos `IncidentStatusUpdateRequest`, `IncidentStatusResponse` y esquemas de error 400/404 | ✅ |

#### Detalle por endpoint que requiere trabajo

- **`GET /health`**: devuelve un diccionario sin modelo. La salida esperada es únicamente `status`.
- **`POST /api/incidents`**: recibe un diccionario libre y devuelve todos los campos del documento, incluido `updated_at`. Se definirá una entrada con nombres explícitos y una confirmación mínima con `id`; se conservará la validación actual, incluyendo el comportamiento histórico del campo `status` (se valida si viene, pero no cambia que el estado inicial sea `open`). Los valores de error 400 y sus campos se conservarán.
- **`GET /api/incidents`**: serializa documentos TinyDB directamente. Se definirá el esquema del incidente que conserva los campos del tipo cliente y excluye `updated_at`, que no es consumido por la UI. Los filtros y su respuesta de error no cambiarán.
- **`GET /api/incidents/summary`**: la salida es un diccionario anidado sin clases de esquema. Se tiparán explícitamente los cuatro grupos y las claves canónicas utilizadas por el servicio; se conservará `by_category`, `by_origin` y `by_branch`, declarados en el tipo compartido del frontend, aunque la vista actual solo lea `by_status`.
- **`GET /api/incidents/{incident_id}`**: devuelve el documento sin filtrar. Se aplicará el mismo esquema de incidente que al listado y se documentará la salida 404.
- **`PATCH /api/incidents/{incident_id}/status`**: acepta un diccionario abierto y devuelve el documento completo. Se limitará la entrada a `status`, se mantendrá la validación de transición y se devolverá solo `id` y `status`; los códigos 400 y 404 se conservarán.

### Cambios en esquemas de entrada (endpoints de escritura)

`IncidentCreateRequest` y `IncidentStatusUpdateRequest` son independientes de los esquemas de respuesta. Los campos extra se ignoran; la creación no permite asignar `id` ni timestamps, y el estado de entrada sigue siendo solo validado porque la lógica existente crea siempre incidentes en estado `open`.

### Pruebas añadidas y resultados

Se añadieron 9 pruebas en `services/manage_incidentsAPI/tests/test_serialization.py`: esquema explícito en las seis rutas, formas de salida, filtrado de campos internos, confirmaciones de escritura, campos extra no escribibles y conservación de errores 400/404.

- **Línea base** (`pytest -q services/manage_incidentsAPI`): no había pruebas (`no tests ran`, código de salida 5).
- **Resultado final** (`pytest -q services/manage_incidentsAPI`): 9 pasaron.
- `git diff --check`: pasó.

### Verificación manual en `/docs`

**Estado: pendiente de confirmación del usuario.** En `/docs`, sin autenticación:

1. **Lista — `GET /api/incidents?status=open`**: esperado, una lista de incidentes con `id`, `title`, `description`, `category`, `status`, `origin`, `branch` y `created_at`. No debe aparecer `updated_at`.
2. **Escritura — `POST /api/incidents`**: enviar `{"title":"Terminal POS fuera de servicio","description":"No procesa transacciones","category":"equipment_failure","origin":"branch","branch":"central"}`. Esperado: HTTP 201 y `{"id":"<uuid>"}`. No deben aparecer descripción, timestamps ni campos internos en la confirmación.
3. **Resumen — `GET /api/incidents/summary`**: esperado, `by_status`, `by_category`, `by_origin` y `by_branch`, con conteos enteros y todas las claves canónicas. No debe aparecer información de cada incidente.
4. **Escritura — `PATCH /api/incidents/<id>/status`**: con un incidente en estado `open`, enviar `{"status":"in_progress"}`. Esperado: `{"id":"<id>","status":"in_progress"}`. No deben aparecer descripción ni timestamps.

### Hallazgos, riesgos y preguntas abiertas

- El frontend del gestor no lee `updated_at`; se excluirá de la respuesta pública. El tipo `Incident` compartido no declara ese campo.
- No se modificará el frontend ni la lógica de negocio. El campo `status` de creación se conservará en la entrada solo para preservar su validación existente; el servidor continuará creando el incidente como `open`.
- La UI consume el resumen `by_status`; se conservarán también los otros tres grupos ya publicados y declarados por el tipo frontend para evitar una ruptura de contrato innecesaria.

## Servicio: `services/suppliers_api`

### Contexto técnico

- **Framework y librerías**: FastAPI 0.141.1; Pydantic 2.13.4 (sintaxis v2); TinyDB 4.9.0. `requirements.txt` declara FastAPI `>=0.116,<1.0`, TinyDB `>=4.8,<5.0`, Passlib y python-jose para autenticación.
- **Ejecución**: rutas de proveedores y health síncronas; el router de autenticación compartido contiene endpoints síncronos y asíncronos.
- **Persistencia**: TinyDB; `document_to_supplier_payload` añade el `doc_id` como `id`.
- **Estructura y convención**: rutas en `routes/suppliers.py`; modelos de entrada y salida en `models.py` (`SupplierCreate`, `SupplierRateUpdate`, `SupplierStatusUpdate`, `Supplier`).
- **Autenticación**: `main.py` monta además el router `auth` compartido de `JWTauth_api`. El frontend envía sus flujos de autenticación al proxy `/api/auth`, configurado para el servicio JWT separado; esas rutas compartidas ya se auditaron en la sección `JWTauth_api`.
- **Frontend consumidor**: `uis/backoffices/suppliers_tinydb`. La lista y búsqueda por ID usan `GET /suppliers`; formularios y acciones usan `POST`, `PATCH` y `DELETE`.
- **Campos consumidos**: el tipo frontend `Supplier` declara `id`, `name`, `country`, `categories`, `rate_per_unit`, `currency`, `status`, `updated_at`, `contact_email` y `notes`. La UI usa esos campos, incluida `updated_at` para ordenar y mostrar la fecha; todos deben permanecer.
- **Pruebas base**: `pytest -q services/suppliers_api` no encontró pruebas (`no tests ran`, código de salida 5). El entorno virtual del servicio tampoco tiene `pytest`.
- **Clasificación original**: 9 ✅, 1 ⚠️ y 2 ❌ entre las 12 rutas montadas. Las cinco rutas de autenticación ya usan los modelos de respuesta definidos en `JWTauth_api`.

### Endpoints de autenticación

Las siguientes rutas llegan al router compartido `JWTauth_api.auth`. Sus respuestas ya tienen modelos explícitos y no requieren cambios en este servicio.

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/auth/login` | POST | Iniciar sesión | Formulario OAuth2: `username`, `password` | `TokenResponse` | ✅ | `access_token`, `token_type` | Contraseña, hash, email | `TokenResponse`: `access_token`, `token_type` | No aplica | Ninguno; ya está auditado en `JWTauth_api` | ✅ |
| `/auth/forgot-password` | POST | Solicitar recuperación | `ForgotPasswordPayload`: `email` | `MessageResponse` genérico | ✅ | El cliente solo espera la respuesta | Email, token y hash de recuperación | `MessageResponse`: `message` genérico | No aplica | Ninguno; ya está auditado en `JWTauth_api` | ✅ |
| `/auth/reset-password` | POST | Restablecer contraseña | `ResetPasswordPayload`: `token`, `new_password` | `MessageResponse` | ✅ | El cliente solo espera la respuesta | Token y contraseña | `MessageResponse`: `message` | No aplica | Ninguno; ya está auditado en `JWTauth_api` | ✅ |
| `/auth/change-password` | POST | Cambiar contraseña | `ChangePasswordPayload`: `current_password`, `new_password` | `MessageResponse` | ✅ | El cliente solo espera la respuesta | Contraseñas y hash | `MessageResponse`: `message` | No aplica | Ninguno; ya está auditado en `JWTauth_api` | ✅ |
| `/auth/me` | GET | Consultar usuario autenticado | Bearer token | `AuthenticatedUserResponse` | ✅ | `email`, `profile.name`, `profile.phone`, `profile.address` | Hash de contraseña y tokens internos | `id`, `email`, `is_active`, `role`, `created_at`, perfil público | Perfil anidado según el contrato compartido de autenticación | Ninguno; ya está auditado en `JWTauth_api` | ✅ |

### Resto de endpoints

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/health` | GET | Comprobar disponibilidad | Ninguna | Diccionario `{"status": "ok"}` | ❌ | `status` | Ninguno | `HealthResponse`: `status` | No aplica | Añadidos `response_model=HealthResponse` y retorno tipado | ✅ |
| `/suppliers` | POST | Crear proveedor | `SupplierCreate`: `name`, `country`, `categories`, `rate_per_unit`, `currency`, `status`, `contact_email`, `notes` | `Supplier`, que hereda de `SupplierCreate` y añade `id`, `updated_at` | ⚠️ | Todos los campos públicos del proveedor; el cuerpo se usa como respuesta tipada | Ningún campo interno adicional; extras no se aceptan en la entrada | `SupplierResponse`: los diez campos públicos del tipo frontend | Sin relaciones | Añadido esquema independiente `SupplierResponse`; cuerpo JSON conservado | ✅ |
| `/suppliers` | GET | Listar y filtrar proveedores | Query opcional `country`, `category`; autenticación requerida | `list[Supplier]` | ✅ | Los diez campos del tipo `Supplier` | No se identifican campos extra en el modelo | `list[SupplierResponse]`: `id`, `name`, `country`, `categories`, `rate_per_unit`, `currency`, `status`, `updated_at`, `contact_email`, `notes` | Sin relaciones | Cambiada la salida a `SupplierResponse` independiente | ✅ |
| `/suppliers/{supplier_id}` | GET | Buscar proveedor por ID | `supplier_id` de ruta; autenticación requerida | `Supplier` o 404 `detail` | ✅ | Los diez campos del tipo `Supplier` | No se identifican campos extra en el modelo | `SupplierResponse` con los diez campos públicos | Sin relaciones | Cambiada la salida a `SupplierResponse` independiente | ✅ |
| `/suppliers/{supplier_id}/rate` | PATCH | Actualizar tarifa | `SupplierRateUpdate`: `rate_per_unit`; autenticación requerida | `Supplier` | ✅ | Todos los campos del proveedor actualizado, incluidos tarifa, moneda e `id` | Campos no editables y datos ajenos al proveedor | `SupplierResponse` con los diez campos públicos | Sin relaciones | Cambiada la salida a `SupplierResponse`; se conserva la entrada dedicada | ✅ |
| `/suppliers/{supplier_id}/status` | PATCH | Actualizar estado | `SupplierStatusUpdate`: `status`; autenticación requerida | `Supplier` | ✅ | Todos los campos del proveedor actualizado, incluidos estado e `id` | Campos no editables y datos ajenos al proveedor | `SupplierResponse` con los diez campos públicos | Sin relaciones | Cambiada la salida a `SupplierResponse`; se conserva la entrada dedicada | ✅ |
| `/suppliers/{supplier_id}` | DELETE | Eliminar proveedor | `supplier_id` de ruta; autenticación requerida | Sin cuerpo, HTTP 204; no declara `response_model` | ❌ | No se consume cuerpo de respuesta | No aplica | Sin cuerpo, HTTP 204 (`response_model=None` explícito) | No aplica | Añadido `response_model=None`; se conserva 204 vacío | ✅ |

### Detalle por endpoint que requiere trabajo

- **`GET /health`**: devuelve un diccionario sin clase de respuesta. Se añadió `HealthResponse(status)` sin cambiar el cuerpo.
- **`POST /suppliers`**: la respuesta original heredaba del esquema de entrada. Se separaron `SupplierCreate` y `SupplierResponse`, conservando el mismo cuerpo HTTP y los mismos errores de validación.
- **`GET /suppliers`**, **`GET /suppliers/{supplier_id}`**, **`PATCH /suppliers/{supplier_id}/rate`** y **`PATCH /suppliers/{supplier_id}/status`**: ahora usan `SupplierResponse` independiente y mantienen los diez campos usados por el frontend.
- **`DELETE /suppliers/{supplier_id}`**: se declaró explícitamente `response_model=None`; se conserva el estado 204 y el cuerpo vacío.

### Cambios en esquemas de entrada (endpoints de escritura)

`SupplierCreate`, `SupplierRateUpdate` y `SupplierStatusUpdate` permanecen como esquemas de entrada separados. `SupplierResponse` es independiente y contiene los campos públicos usados por la UI. Los esquemas de entrada siguen prohibiendo campos extra (`extra="forbid"`), lo que bloquea la asignación de `id` y timestamps enviados por clientes.

### Pruebas añadidas y resultados

Se añadieron 8 pruebas en `services/suppliers_api/tests/test_serialization.py`: respuesta de health, creación, listados, detalle, actualización de tarifa/estado, borrado 204, filtrado de campos extra y declaración de modelos en las 12 rutas montadas.

- **Línea base** (`pytest -q services/suppliers_api`): no había pruebas (`no tests ran`, código de salida 5); `pytest` tampoco está instalado en el entorno virtual del servicio.
- **Resultado final** (`pytest -q services/suppliers_api`): 8 pasaron.
- La aplicación también cargó en el entorno virtual propio y generó OpenAPI con 10 paths (12 operaciones HTTP).
- `git diff --check`: pasó.

### Verificación manual en `/docs`

**Estado: confirmada por el usuario.** El usuario informó que la prueba manual fue exitosa.

1. **Lista — `GET /suppliers?country=Colombia&category=carne`**: esperado, lista de proveedores con `id`, `name`, `country`, `categories`, `rate_per_unit`, `currency`, `status`, `updated_at`, `contact_email` y `notes`. No deben aparecer campos no declarados por `SupplierResponse`.
2. **Escritura — `POST /suppliers`**: enviar `{"name":"Proveedor de prueba","country":"Colombia","categories":["carne"],"rate_per_unit":28500,"currency":"COP","status":"active","contact_email":"ventas@example.com","notes":"Prueba"}`. Esperado: HTTP 201 y la representación pública con los diez campos; campos extra como `id` o `updated_at` enviados por el cliente deben rechazarse.
3. **Actualización — `PATCH /suppliers/1/rate`**: enviar `{"rate_per_unit":30000}`. Esperado: representación pública actualizada, con `rate_per_unit` igual a `30000`; campos extra como `id` deben rechazarse.
4. **Borrado — `DELETE /suppliers/1`**: esperado HTTP 204 sin cuerpo.

### Hallazgos, riesgos y preguntas abiertas

- `updated_at` se conserva porque la UI lo usa para ordenar proveedores y mostrar la última actualización.
- Las rutas de proveedores requieren el bearer token del servicio JWT; no se modifica autenticación.
- El borrado devuelve HTTP 204 sin cuerpo, declarado explícitamente.

## Servicio: `services/inventory_management_API`

### Contexto técnico

- **Framework y librerías**: FastAPI 0.143.0, Pydantic 2.13.5, SQLModel 0.0.47 en el entorno virtual del servicio. `requirements.txt` declara FastAPI `>=0.116,<1.0`, SQLModel `>=0.0.24,<1.0`, psycopg2-binary y python-dotenv.
- **Ejecución**: rutas de inventario síncronas; se monta además el router compartido de autenticación.
- **Persistencia**: PostgreSQL con SQLModel/SQLAlchemy. `main.py` crea tablas al importar la aplicación.
- **Rutas**: `routers/inventory.py`; entidades en `models.py`; modelos Pydantic en `schemas.py`.
- **Autenticación**: `main.py` incluye las cinco rutas de JWTauth si `ENABLE_AUTH_ROUTES` está habilitado (por defecto, `true`). Las rutas de inventario consultivas son públicas; escrituras requieren `get_current_user`.
- **Frontend consumidor**: `uis/backoffices/administrar_inventario`. Consume el catálogo de productos, el detalle para consultar stock, el historial y confirmaciones de escritura.
- **Campos consumidos**: producto: `id`, `name`, `sku`, `unit`, `category`, `country`, `current_stock`; movimiento en historial: `id`, `movement_type`, `quantity`, `created_at`, `user_uuid`, y del producto `name`, `sku`, `unit`. El frontend muestra `user_uuid` como usuario y no consulta en las confirmaciones de escritura campos de movimiento.
- **Pruebas base**: `pytest -q services/inventory_management_API` no encontró pruebas (código 5). El entorno virtual no tiene pytest y el Python global no tiene SQLModel; no hay pruebas Python del servicio en `/tests`.
- **Clasificación original**: 7 ✅, 3 ⚠️ y 1 ❌ de 11 rutas con la configuración predeterminada. Las cinco rutas compartidas de auth ya cuentan con esquemas explícitos auditados en `JWTauth_api`.

### Endpoints de autenticación

Las rutas siguientes se incluyen si `ENABLE_AUTH_ROUTES` no es `false`. Reutilizan esquemas del router compartido `JWTauth_api.auth`.

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/auth/login` | POST | Iniciar sesión | Formulario OAuth2: `username`, `password` | `TokenResponse` | ✅ | `access_token`, `token_type` | Contraseña y hash | `TokenResponse`: `access_token`, `token_type` | No aplica | Ninguno; esquema compartido ya auditado | ✅ |
| `/auth/forgot-password` | POST | Solicitar recuperación | `ForgotPasswordPayload`: `email` | `MessageResponse` genérico | ✅ | Mensaje genérico | Email, token y hash de recuperación | `MessageResponse`: `message` | No aplica | Ninguno; esquema compartido ya auditado | ✅ |
| `/auth/reset-password` | POST | Restablecer contraseña | `ResetPasswordPayload`: `token`, `new_password` | `MessageResponse` | ✅ | Mensaje de confirmación | Token y contraseña | `MessageResponse`: `message` | No aplica | Ninguno; esquema compartido ya auditado | ✅ |
| `/auth/change-password` | POST | Cambiar contraseña | `ChangePasswordPayload`: `current_password`, `new_password` | `MessageResponse` | ✅ | Mensaje de confirmación | Contraseñas y hash | `MessageResponse`: `message` | No aplica | Ninguno; esquema compartido ya auditado | ✅ |
| `/auth/me` | GET | Consultar usuario autenticado | Bearer token | `AuthenticatedUserResponse` | ✅ | El servicio de inventario no consume el perfil; la vista de inventario usa su contexto de auth | Hash de contraseña y tokens internos | `id`, `email`, `is_active`, `role`, `created_at`, perfil público | Perfil anidado según el contrato de autenticación | Ninguno; esquema compartido ya auditado | ✅ |

### Resto de endpoints

#### Tabla de auditoría

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/inventory/products` | GET | Listar productos y stock calculado | Ninguna | `list[IngredientResponse]`; salida tipada, pero compartía base con entrada | ✅ | `id`, `name`, `sku`, `unit`, `category`, `country`, `current_stock` | Relaciones ORM y movimientos de entrada/salida | `list[IngredientResponse]` con esos siete campos | Sin relaciones; stock se entrega como proyección escalar calculada | `IngredientResponse` pasa a ser esquema independiente, misma forma | ✅ |
| `/inventory/products` | POST | Crear producto | `IngredientCreate`: `name`, `sku`, `unit`, `category`, `country` | `IngredientResponse` heredada de `IngredientCreate` | ⚠️ | Campos del producto y stock inicial `0` | PK generada; relaciones y datos de auditoría no pertenecen a la entrada | `IngredientResponse`: los siete campos públicos | Sin relaciones | `IngredientResponse` independiente de `IngredientCreate`; extras no asignan `id` ni stock | ✅ |
| `/inventory/products/{product_id}` | GET | Consultar producto y stock | `product_id` de ruta | `IngredientResponse` o 404 `detail` | ✅ | Los siete campos del producto | Relaciones ORM | `IngredientResponse`: los siete campos públicos | Sin relaciones; stock calculado, no se anida el historial | Cambiada a esquema de salida independiente | ✅ |
| `/inventory/orders/inbound` | POST | Registrar entrada de inventario | `IngredientEntryCreate`: `ingredient_id`, `quantity`, `supplier_name`, `location_id` | `IngredientEntryResponse`, heredada de la entrada; incluye `id`, `created_at`, `user_uuid` | ⚠️ | El cliente no lee el cuerpo de confirmación; tras escribir, refresca productos | Usuario lo asigna el servidor; relaciones ORM | `IngredientEntryResponse`: respuesta de movimiento con sus campos declarados | No aplica en confirmación | Respuesta independiente; `user_uuid` sigue asignado por el servidor | ✅ |
| `/inventory/orders/outbound` | POST | Registrar salida de inventario | `IngredientExitCreate`: `ingredient_id`, `quantity`, `reason`, `location_id` | `IngredientExitResponse`, heredada de la entrada; incluye `id`, `created_at`, `user_uuid` | ⚠️ | El cliente no lee el cuerpo de confirmación; tras escribir, no depende de campos extra | Usuario lo asigna el servidor; relaciones ORM | `IngredientExitResponse`: respuesta de movimiento con sus campos declarados | No aplica en confirmación | Respuesta independiente; `user_uuid` sigue asignado por el servidor | ✅ |
| `/inventory/orders` | GET | Historial de entradas y salidas | Ninguna | Lista de diccionarios sin `response_model`; carga y anida el ingrediente completo | ❌ | `id`, `movement_type`, `quantity`, `created_at`, `user_uuid`; ingrediente: `name`, `sku`, `unit` | `ingredient_id`, `location_id`, `supplier_name`, `reason` y campos ORM no usados por el historial | `list[OrderResponse]`: `id`, `movement_type`, `quantity`, `created_at`, `user_uuid`, `ingredient` (`name`, `sku`, `unit`) | Proyección anidada mínima del producto, pues historial muestra esos campos junto al movimiento | Añadido `response_model=list[OrderResponse]`; proyección tipada excluye campos no usados | ✅ |

### Detalle por endpoint que requiere trabajo

- **`GET /inventory/orders`**: antes devolvía una lista sin modelo. Ahora usa un esquema de movimiento con `id`, `movement_type`, `quantity`, `created_at`, `user_uuid` y un objeto `ingredient` con `name`, `sku`, `unit`. `user_uuid` se conserva porque la pantalla lo muestra. La relación es una proyección anidada y no un ORM ni el objeto completo.
- **`POST /inventory/products`**, **`GET /inventory/products`** y **`GET /inventory/products/{product_id}`**: se separó `IngredientResponse` manteniendo sus siete campos públicos.
- **`POST /inventory/orders/inbound` y `/outbound`**: se separaron los esquemas de respuesta de sus entradas, manteniendo el contrato existente y la asignación de `user_uuid` en el servidor.

### Cambios en esquemas de entrada (endpoints de escritura)

`IngredientCreate`, `IngredientEntryCreate` e `IngredientExitCreate` siguen siendo esquemas de entrada separados. `IngredientResponse`, `IngredientEntryResponse` e `IngredientExitResponse` ahora son independientes. El servidor continúa asignando `user_uuid` a partir del usuario autenticado y no copia ese campo de la entrada del cliente.

### Pruebas añadidas y resultados

Se añadieron 7 pruebas en `services/inventory_management_API/tests/test_serialization.py`: modelos explícitos en las seis rutas de inventario y cinco rutas de autenticación; proyección de producto, detalle, entradas/salidas, filtrado de `user_uuid` no confiable y forma del historial con la relación anidada mínima.

- **Línea base** (`pytest -q services/inventory_management_API`): no había pruebas (código 5). El virtualenv no contiene pytest; el Python global no contiene SQLModel.
- **Resultado final** (`PYTHONPATH=services/inventory_management_API/myenv/lib/python3.12/site-packages pytest -q services/inventory_management_API`): 7 pasaron. Se ejecutaron con SQLite en memoria; no se necesitó PostgreSQL.
- Advertencia no bloqueante de Passlib: `crypt` está obsoleto y será retirado en Python 3.13.

### Verificación manual en `/docs`

**Estado: confirmada por el usuario.** El usuario informó que la checklist manual fue exitosa.

1. **Lista — `GET /inventory/products`**: esperado, lista con `id`, `name`, `sku`, `unit`, `category`, `country`, `current_stock`; sin relaciones ni movimientos anidados.
2. **Escritura — `POST /inventory/products`**: enviar `{"name":"Harina","sku":"HAR-001","unit":"kg","category":"secos","country":"Colombia"}`. Esperado HTTP 200 y esos campos más un `id` generado y `current_stock: 0`; no deben aparecer relaciones ORM.
3. **Escritura — `POST /inventory/orders/inbound`**: usando el `id` del producto creado, enviar `{"ingredient_id":1,"quantity":10,"supplier_name":"Proveedor Uno","location_id":1}`. Esperado HTTP 200 con `id`, `ingredient_id`, `quantity`, `supplier_name`, `location_id`, `created_at`, `user_uuid`; el usuario debe ser el autenticado.
4. **Historial — `GET /inventory/orders`**: esperado, movimientos con `id`, `movement_type`, `quantity`, `created_at`, `user_uuid` y `ingredient: {name, sku, unit}`; no deben aparecer `location_id`, `supplier_name`, `reason` ni otros campos del producto.

### Hallazgos, riesgos y preguntas abiertas

- El endpoint de órdenes incluye `user_uuid`, un dato de identidad que el frontend muestra explícitamente; se conserva en la respuesta.
- La lista de historial no devuelve `location_id`, `supplier_name` ni `reason`; no se añaden a la respuesta porque la vista no los consume.
- `main.py` habilita las rutas auth por defecto mediante `ENABLE_AUTH_ROUTES`; el conteo considera cinco rutas auth si está habilitado.

## Servicio: backend de análisis (`services/api` + `services/incidents`)

### Contexto técnico

- **Framework y librerías**: FastAPI 0.141.1 y Pydantic 2.13.4. `services/api/requirements.txt` declara FastAPI y `python-multipart`; `services/incidents` es un módulo de lógica sin servidor ni archivo de dependencias propio.
- **Ejecución**: `POST /api/incidents/analyze` es asíncrono para leer el archivo subido y ejecuta el analizador CSV síncrono; health y exportación son síncronos.
- **Datos**: procesamiento en memoria desde `UploadFile`; `AnalysisResult` es un dataclass interno. El último resultado analizado se guarda en memoria de proceso, no en una base de datos.
- **Estructura**: aplicación y health en `services/api/app/main.py`; router en `services/api/app/routers/incidents.py`; Pydantic response models en `services/api/app/schemas.py`; lógica, análisis y generación CSV en `services/incidents/analysis.py`.
- **Frontend consumidor**: `uis/backoffices/analizador_incidentes`. Envía `POST /api/incidents/analyze` con un archivo bajo el campo multipart `file`, muestra la respuesta JSON y descarga `GET /api/incidents/results/export` como archivo CSV.
- **Campos usados**: `source_file`, contadores, desgloses por regla/categoría/estado y el índice/desglose de satisfacción, todos definidos en `IncidentAnalysisResponse` y su tipo TypeScript. El frontend no recibe ni representa las filas originales del CSV.
- **Pruebas base**: `pytest -q services/incidents services/api` encontró cero pruebas (código 5). El runner `pytest` está disponible, pero no existe cobertura de Python para estos módulos.
- **Clasificación original**: 1 ✅, 0 ⚠️ y 2 ❌ en tres rutas HTTP: análisis con esquema de respuesta; health y exportación sin `response_model` explícito.

### Endpoints de autenticación

Este backend no registra endpoints de autenticación.

### Resto de endpoints

#### Tabla de auditoría

| Ruta | Método | Propósito | Entrada (esquema actual) | Respuesta actual | Estado original | Campos que consume el frontend | Campos que deben permanecer internos | Esquema de salida objetivo y campos | Decisión sobre relaciones | Cambios aplicados | Estado final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/health` | GET | Comprobar disponibilidad | Ninguna | Diccionario `{"status": "ok"}` sin modelo | ❌ | `status` | No aplica | `HealthResponse`: `status` | No aplica | Añadidos `response_model=HealthResponse` y retorno tipado | ✅ |
| `/api/incidents/analyze` | POST | Analizar archivo CSV subido | `UploadFile` multipart, campo `file` | `IncidentAnalysisResponse` | ✅ | `source_file`, `total_records`, `valid_records`, `invalid_records`, `invalid_breakdown` (`rule`, `label`, `count`), `category_breakdown` (`category`, `count`, `percentage`), `status_breakdown` (`status`, `count`, `percentage`) e `satisfaction_index` (`closed_cases`, `scored_closed_cases`, `average_score`, `breakdown` con `score`, `label`, `count`, `percentage`) | Filas originales, identificadores de clientes y reporteros, descripciones y otros valores individuales del CSV | `IncidentAnalysisResponse` con exactamente esos campos agregados | No aplica; no se devuelven registros ni relaciones del CSV | Ninguno; el modelo existente es explícito y coincide con el consumidor | ✅ |
| `/api/incidents/results/export` | GET | Descargar métricas del último análisis | Ninguna | CSV en `Response`, sin `response_model` explícito; 404 JSON si aún no hay análisis | ❌ | Archivo CSV descargable; columnas `metric`, `value`, `percentage` | Filas originales e identificadores o datos personales del CSV | Respuesta CSV `text/csv`, encabezados `metric,value,percentage`, nombre de archivo `incident-analysis-results.csv`; error 404 con `detail` | No aplica | Declarados `response_model=None`, `response_class=Response` y respuestas CSV/404 en OpenAPI | ✅ |

### Detalle por endpoint que requiere trabajo

- **`GET /health`**: se añadió `HealthResponse(status)` sin alterar el cuerpo.
- **`GET /api/incidents/results/export`**: la respuesta es CSV, no JSON, por lo que se declara explícitamente `response_model=None` y `response_class=Response`; OpenAPI describe CSV y error 404. El contenido sigue siendo únicamente métricas agregadas.

### Cambios en esquemas de entrada (endpoints de escritura)

No hay endpoints JSON de escritura. El análisis recibe un archivo multipart `UploadFile` y el endpoint existente ya declara el parámetro. No se modificarán las reglas del parser ni el procesamiento del CSV.

### Pruebas añadidas y resultados

Se añadieron 8 pruebas en `services/api/tests/test_serialization.py`: modelos de ruta, generación OpenAPI, health, shape JSON completo del análisis, ausencia de datos originales en JSON/CSV, errores de carga y exportación previa al análisis.

- **Línea base** (`pytest -q services/incidents services/api`): no había pruebas (código 5).
- **Resultado final** (`pytest -q services/api/tests/test_serialization.py`): 8 pasaron.

### Verificación manual en `/docs`

**Estado: pendiente de confirmación del usuario.** Pruebas sugeridas:

1. **Health — `GET /health`**: esperado HTTP 200 y `{"status":"ok"}`.
2. **Análisis — `POST /api/incidents/analyze`**: adjuntar un archivo `analisis.csv` en el campo multipart `file`, con este contenido:

   ```csv
   incident_id,date,location_id,category,description,status,customer_id,satisfaction_score,reporter_id
   INC-1,2026-10-25,COL-01,CUSTOMER_COMPLAINT,Cliente reporta demora en pedido,CLOSED,CLIENTE-1,5,REPORTERO-1
   ```

   Esperado: HTTP 200 y JSON agregado con los campos de `IncidentAnalysisResponse`; no deben aparecer `INC-1`, `CLIENTE-1`, `REPORTERO-1` ni la descripción original.
3. **Exportación — `GET /api/incidents/results/export`**: tras analizar un CSV en la misma instancia, esperado HTTP 200, `Content-Type: text/csv` y `Content-Disposition: attachment; filename="incident-analysis-results.csv"`. El CSV debe tener columnas `metric,value,percentage` y solo métricas agregadas; sin datos de filas originales.
4. **Sin análisis previo — `GET /api/incidents/results/export`**: esperado HTTP 404 con `{"detail":"No analysis result is available yet. Run /api/incidents/analyze first."}`.

### Hallazgos, riesgos y preguntas abiertas

- El backend conserva solo el último resultado en memoria de proceso. El frontend informa esta limitación; no se cambia persistencia en una auditoría de serialización.
- La exportación es CSV; su contrato se documenta como texto/tabular en vez de inventar un modelo JSON.
- El nombre del archivo fuente se conserva porque el frontend lo muestra como `source_file`; no se exportan los registros individuales del CSV.
