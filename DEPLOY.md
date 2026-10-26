# Deploy de `backoffices/my-app`

## APIs locales con Docker Compose

Desde la raiz del repositorio, con Docker y Docker Compose disponibles:

```bash
export JWT_SECRET="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
docker compose up --build -d
docker compose ps
```

Conserva el mismo `JWT_SECRET` entre reinicios para no invalidar tokens existentes.
Tambien puedes definirlo en un archivo `.env` local en la raiz (no versionado).

- Inventario: http://localhost:8000/docs
- Autenticacion JWT: http://localhost:8001/docs
- Incidencias: http://localhost:8002/docs

Un unico `services/Dockerfile` contiene tres destinos de construccion:
`inventory`, `auth` e `incidents`. Compose construye una imagen por destino y
ejecuta cada API en su propio contenedor. Todas escuchan internamente en el
puerto 8000; los puertos publicados del host son distintos. PostgreSQL se inicia
en un cuarto contenedor, sin publicar su puerto al host.

Los volumenes conservan los datos al ejecutar `docker compose down`. Las bases
empiezan vacias; no se copian datos locales ni archivos `.env` a las imagenes.
Para consultar registros o detener los servicios:

```bash
docker compose logs -f inventory auth incidents
docker compose down
```

Esta configuracion es para desarrollo local: cambia las credenciales de
PostgreSQL y revisa la exposicion de puertos antes de desplegarla en produccion.
Inventario importa actualmente el modulo JWT y consulta su TinyDB, por eso ambos
montan `auth-data` y reciben el mismo secreto. TinyDB no garantiza escrituras
concurrentes entre procesos: realiza altas y cambios de usuarios desde `auth`,
no desde las rutas `/auth` duplicadas en inventario. Para produccion, centraliza
la autenticacion o migra los usuarios a una base que soporte concurrencia.

El frontend no forma parte de este Compose; puede iniciarse como se indica abajo.

Este proyecto depende de dos procesos separados:

- el backend FastAPI, que debe iniciarse desde la raíz del repositorio;
- el frontend Next.js, que vive en `uis/backoffices/my-app`.

## 1. Iniciar el backend desde la raíz del proyecto

Antes de levantar o desplegar el frontend, inicia el servidor API desde la raíz del repositorio:

```bash
cd /workspaces/LucaFontana_Hito0
python -m uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Esto es necesario porque el proyecto Next consume el backend de incidencias a través de sus route handlers internos.

## 2. Build y arranque del proyecto Next.js

En otra terminal, entra al proyecto de backoffice:

```bash
cd /workspaces/LucaFontana_Hito0/uis/backoffices/my-app
```

Instala dependencias si todavía no lo hiciste:

```bash
npm install
```

Genera el build de producción:

```bash
npm run build
```

Y luego arranca el proyecto con:

```bash
npm run start
```

El orden importa: primero debe estar levantado el servidor desde la raíz del proyecto y después debe hacerse el deploy o arranque del proyecto Next con `npm run start` para que funcione correctamente.

## 3. Variable opcional de backend

Si el backend no corre en `http://127.0.0.1:8000`, define esta variable antes de arrancar Next:

```bash
INCIDENTS_API_BASE_URL=http://tu-backend:8000
```

Por ejemplo:

```bash
cd /workspaces/LucaFontana_Hito0/uis/backoffices/my-app
INCIDENTS_API_BASE_URL=http://127.0.0.1:8000 npm run start
```

## VPS DigitalOcean

La configuracion de produccion, el acceso inicial por tunel SSH y la preparacion de GitHub Actions estan documentados en [DEPLOY_VPS.md](DEPLOY_VPS.md).