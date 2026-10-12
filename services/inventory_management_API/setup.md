# Guia de instalacion y ejecucion

Esta guia describe como preparar y ejecutar la API de inventario junto con la autenticacion compartida de `services/JWTauth_api`.

## Requisitos

- Python 3.12 o superior.
- Acceso de red a la base PostgreSQL configurada para inventario.
- Los archivos `.env` locales configurados para inventario y JWTauth.

La API usa PostgreSQL para los ingredientes y movimientos. JWTauth mantiene usuarios y perfiles en su propia base TinyDB.

## Crear y activar el entorno

Ejecuta los comandos desde la carpeta del servicio:

```bash
cd services/inventory_management_API
python3 -m venv myenv
source myenv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Crea `myenv` solo la primera vez. En las siguientes sesiones, activa el entorno e instala cualquier dependencia nueva con el mismo interprete:

```bash
cd services/inventory_management_API
source myenv/bin/activate
python -m pip install -r requirements.txt
```

Comprueba que el entorno activo tiene las dependencias:

```bash
python -c "import fastapi, sqlmodel, psycopg2; print('Dependencias disponibles')"
```

Usa `python -m pip` y `python -m uvicorn` para asegurarte de que los comandos usan el Python de `myenv`. Si aparece `ModuleNotFoundError: No module named 'sqlmodel'`, activa `myenv` e instala `requirements.txt` de nuevo.

## Variables de entorno

Antes de iniciar el backend, configura:

- `services/inventory_management_API/.env`: debe incluir `DATABASE_URL` con la URL de PostgreSQL para inventario.
- `services/JWTauth_api/.env`: debe incluir `JWT_SECRET`, la clave con la que JWTauth firma y valida los tokens.

JWTauth carga su propio `.env`; no hace falta copiar `JWT_SECRET` al archivo de inventario. No publiques ninguno de estos archivos ni sus valores. Si la contraseña de PostgreSQL contiene caracteres especiales, codificalos para URL dentro de `DATABASE_URL`.

Arranca el servicio desde `services/inventory_management_API`: su `database.py` carga el `.env` del directorio actual. Al importar la aplicacion se crean las tablas de inventario si todavia no existen, por lo que la base debe estar accesible y el usuario debe tener permisos para crear tablas.

## Iniciar la API y abrir Swagger

Con `myenv` activo y la terminal situada en `services/inventory_management_API`:

```bash
python -m uvicorn main:app --reload
```

Uvicorn escucha en el puerto `8000`. Abre Swagger UI en:

```text
http://127.0.0.1:8000/docs
```

La documentacion alternativa esta en `http://127.0.0.1:8000/redoc`. En Codespaces, abre o reenvia el puerto 8000 y usa la URL que muestra VS Code.

Para detener el servidor, pulsa `Ctrl+C`. Para salir del entorno virtual, ejecuta `deactivate`.

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

- **`No module named 'sqlmodel'`**: confirma que `myenv` esta activo (`which python` debe apuntar a `services/inventory_management_API/myenv/bin/python`) y vuelve a ejecutar `python -m pip install -r requirements.txt`.
- **`DATABASE_URL no esta configurada`**: confirma que el archivo `services/inventory_management_API/.env` existe, contiene `DATABASE_URL` y que arrancaste desde la carpeta del servicio.
- **Error al conectar con PostgreSQL**: revisa la URL, la conectividad de red, el estado del servidor y que la dependencia `psycopg2-binary` este instalada en `myenv`.
- **`401 Unauthorized` en una escritura**: inicia sesion en `/auth/login`, autoriza Swagger con el token y comprueba que `JWT_SECRET` corresponde al configurado en JWTauth.
- **El seed dice que ya hay ingredientes**: es el comportamiento esperado si la tabla no esta vacia; el seed no es una herramienta de reinicio de la base.
