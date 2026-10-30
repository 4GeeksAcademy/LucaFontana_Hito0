# Backend y backoffice unificados

Ejecuta los comandos desde la raiz del repositorio.

## 1. Backend

Configura `DATABASE_URL`, `JWT_SECRET` y las demas variables del backend antes de iniciar:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Este proceso sirve autenticacion, inventario, proveedores e incidencias. La documentacion esta en `http://localhost:8000/docs`.

## 2. Instalar dependencias del frontend

```bash
corepack pnpm install --frozen-lockfile
```

No ejecutes instalaciones independientes en las carpetas antiguas.

## 3. Iniciar el portal

En otra terminal, para desarrollo:

```bash
corepack pnpm --filter backoffice-portal dev
```

Para produccion:

```bash
corepack pnpm --filter backoffice-portal build
corepack pnpm --filter backoffice-portal start
```

Todas las interfaces se sirven desde `http://localhost:3000`: `/incidentes`, `/inventario`, `/analizador-incidentes`, `/proveedores` y `/talent-pipeline-tracker`. No se necesitan servidores en los puertos 3101 a 3105. El website es independiente.

## Configuracion del portal

Configura las variables locales en `uis/backoffices/portal/.env.local` y reinicia el portal:

- `AUTH_API_BASE_URL`, `INVENTORY_API_BASE_URL`, `SUPPLIERS_API_BASE_URL` e `INCIDENTS_API_BASE_URL`: por defecto, `http://127.0.0.1:8000`.
- `NEXT_PUBLIC_TALENT_API_URL`: URL de la API de candidaturas accesible desde el navegador, sin agregar `/records`. Debe estar definida antes del build de produccion.
- `PASSWORD_RESET_URL`: se configura en el backend con la URL publica del portal mas `/reset-password`.

Consulta las rutas y detalles en el [README del portal](uis/backoffices/portal/README.md).

## Docker Compose

```bash
docker compose up --build interfaces
```

El servicio de interfaces instala el workspace con pnpm y arranca solo el portal (3000) y el website (3001). Compose inicia sus dependencias backend. No uses `down -v` para actualizar: eliminaria tambien volumenes de datos.

Si reutilizas volumenes de dependencias de una imagen anterior, actualizalos sin borrar datos:

```bash
docker compose run --rm --no-deps interfaces corepack pnpm install --frozen-lockfile
docker compose up --build interfaces
```

## Limpieza de la migracion

El codigo ejecutable de las cinco aplicaciones originales se retiro. Sus carpetas pueden conservar archivos restringidos, configuraciones locales, recursos estaticos y caches. No participan del workspace ni del arranque; no se eliminaron automaticamente sus `node_modules`, `.next`, archivos de entorno ni lockfiles npm.
