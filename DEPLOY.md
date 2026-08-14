# Deploy de `backoffices/my-app`

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