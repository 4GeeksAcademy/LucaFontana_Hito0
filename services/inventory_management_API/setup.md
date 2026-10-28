# Guia de instalacion y ejecucion

Esta guia describe el modulo de inventario. En el uso habitual forma parte del backend unificado junto con auth, proveedores y las APIs de incidencias.

## Requisitos

- Python 3.12 o superior.
- Acceso de red a la base PostgreSQL configurada para inventario.
- Las variables de entorno requeridas por el backend unificado, incluyendo `DATABASE_URL` y `JWT_SECRET`.

La API usa PostgreSQL para los ingredientes y movimientos. JWTauth mantiene usuarios y perfiles en su propia base TinyDB.

## Preparar el entorno

Desde la raíz del repositorio, crea el entorno virtual si todavía no existe, actívalo e instala las dependencias de toda la aplicación:

```bash
python3 -m venv myenv
source myenv/bin/activate
python -m pip install -r services/api/requirements.txt
```

En sesiones siguientes basta con activar `myenv`. Si aparece `ModuleNotFoundError`, vuelve a instalar `services/api/requirements.txt` desde la raíz.

## Variables de entorno

Antes de iniciar el backend unificado, proporciona `DATABASE_URL` y `JWT_SECRET` al proceso, por ejemplo mediante la configuración local de entorno. No publiques secretos. Si la contraseña de PostgreSQL contiene caracteres especiales, codifícalos para URL dentro de `DATABASE_URL`.

Al iniciar la aplicación unificada se crean las tablas de inventario si todavía no existen; la base debe estar accesible y el usuario debe tener permisos para crear tablas.

## Iniciar la API y abrir Swagger

Desde la raíz del repositorio, inicia el backend completo con:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Este único proceso levanta inventario junto con autenticación, proveedores y las APIs de incidencias. Todos los endpoints están en el puerto `8000`. Abre Swagger UI en:

```text
http://127.0.0.1:8000/docs
```

La documentacion alternativa esta en `http://127.0.0.1:8000/redoc`. En Codespaces, abre o reenvia el puerto 8000 y usa la URL que muestra VS Code.

Para detener el backend, pulsa `Ctrl+C`.

## Autenticacion

El registro de usuarios pertenece al backend JWTauth y se expone como `POST /users` (no como `/auth/register`). En Swagger, crea un usuario con un body similar a este:

```json
{
  "email": "tu-correo@example.com",
  "password": "reemplaza-por-una-clave-segura",
  "name": "Usuario de inventario"
}
```

Guarda el `id` numerico devuelto. Para obtener un token, usa `POST /auth/login` con el formulario OAuth2: `username` debe ser el correo y `password` la clave. Tambien puedes usar el boton **Authorize** de Swagger para autenticar las rutas protegidas.

Las rutas de escritura de inventario requieren un token Bearer. Las consultas GET de inventario son publicas en la implementacion actual.

## Cargar los datos de ejemplo

`seed.py` inserta seis ingredientes y movimientos de entrada y salida. Antes de ejecutarlo:

1. Confirma que `DATABASE_URL` apunta a la base de inventario correcta. El seed escribe datos; no lo ejecutes contra produccion por accidente.
2. Crea o identifica un usuario en JWTauth mediante `POST /users` y copia su `id` numerico.
3. Abre `seed.py` y cambia `USER_UUID` para que contenga ese `id` como texto, por ejemplo `USER_UUID = "3"`. Aunque la columna se llama `user_uuid`, JWTauth devuelve un `id` entero y el backend lo almacena como cadena.
4. Activa `myenv` y ejecuta desde `services/inventory_management_API`:

```bash
python seed.py
```

El script crea las tablas si hacen falta. Solo carga datos cuando la tabla de ingredientes esta vacia; si ya encuentra un ingrediente, termina sin cargar nada. No elimina ni reemplaza datos existentes. Al finalizar, consulta `GET /inventory/products` desde Swagger para revisar ingredientes y stock.

## Rutas principales

- `POST /users`: crear usuario en JWTauth.
- `POST /auth/login`: iniciar sesion y obtener un token.
- `GET /auth/me`: consultar el usuario autenticado.
- `GET /inventory/products`: listar ingredientes con stock calculado.
- `POST /inventory/products`: crear un ingrediente (requiere token).
- `POST /inventory/orders/inbound`: registrar una entrada (requiere token).
- `POST /inventory/orders/outbound`: registrar una salida (requiere token).
- `GET /inventory/orders`: listar movimientos.

Las cantidades de entradas y salidas no pueden ser negativas. El stock se calcula como entradas menos salidas.

## Solucion de problemas

- **`No module named 'sqlmodel'`**: confirma que el `myenv` de la raíz está activo y ejecuta `python -m pip install -r services/api/requirements.txt` desde la raíz.
- **`DATABASE_URL no esta configurada`**: confirma que `DATABASE_URL` está disponible para el proceso del backend antes de iniciarlo desde la raíz.
- **Error al conectar con PostgreSQL**: revisa la URL, la conectividad de red, el estado del servidor y que las dependencias de `services/api/requirements.txt` estén instaladas en `myenv`.
- **`401 Unauthorized` en una escritura**: inicia sesion en `/auth/login`, autoriza Swagger con el token y comprueba que `JWT_SECRET` corresponde al configurado en JWTauth.
- **El seed dice que ya hay ingredientes**: es el comportamiento esperado si la tabla no esta vacia; el seed no es una herramienta de reinicio de la base.
