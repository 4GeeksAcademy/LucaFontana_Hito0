# Backend unificado

Desde la raíz del repositorio, inicia el backend con:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Este único proceso levanta al mismo tiempo todos los routers del backend: autenticación (`/auth`, `/users`, `/profiles`), inventario (`/inventory`), proveedores (`/suppliers`), gestión de incidencias (`/api/incidents`) y análisis CSV (`/api/incidents/analyze` y `/api/incidents/results/export`). No es necesario iniciar una API por dominio ni usar los puertos `8001` y `8002`.

La documentación interactiva de todos los endpoints queda en [http://localhost:8000/docs](http://localhost:8000/docs). Configura las variables necesarias, como `DATABASE_URL` y `JWT_SECRET`, en el entorno antes de iniciar el proceso.

El comando inicia el backend; no inicia los proyectos Next.js del frontend, que se ejecutan por separado.

Este proyecto depende de dos procesos separados:

- el backend FastAPI, que debe iniciarse desde la raíz del repositorio;
- el frontend Next.js, que vive en `uis/backoffices/my-app`.

## 1. Iniciar el backend desde la raíz del proyecto

Para iniciar el backend, ejecuta desde la raíz del repositorio:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Este es el único comando necesario para el backend: deja disponibles todos los dominios y endpoints en el puerto `8000`.

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