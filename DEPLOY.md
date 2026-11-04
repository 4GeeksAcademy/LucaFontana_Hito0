# Despliegue del proyecto

El backend unificado sirve autenticacion, inventario, proveedores e incidencias en el puerto `8000`. El sitio publico usa `3000` y el portal de backoffice `3001`. El inventario se conecta a Supabase; autenticacion, proveedores e incidencias conservan sus datos JSON en volumenes persistentes.

## Desarrollo local sin Docker

Desde la raiz del repositorio, configura `DATABASE_URL` y `JWT_SECRET` y ejecuta:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

En otra terminal, instala el workspace e inicia las interfaces:

```bash
corepack pnpm install --frozen-lockfile
sh uis/start.sh
```

El website queda en `http://localhost:3000`; el backoffice, en `http://localhost:3001`. La API unificada esta en `http://localhost:8000/docs`.

## Despliegue en una VPS por IP

El `docker-compose.yaml` de la raiz es la configuracion de despliegue. Construye el backend unificado y las dos aplicaciones Next.js en modo produccion. Publica website `3000`, backoffice `3001` y API `8000`; no inicia un PostgreSQL local porque inventario usa Supabase.

### 1. Preparar las variables

En la VPS, crea `.env.production` en la raiz del repositorio. No lo subas a Git. Define:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL PostgreSQL de Supabase para inventario; usa la cadena de conexion recomendada por Supabase y SSL. |
| `JWT_SECRET` | Valor aleatorio largo y persistente entre reinicios. |
| `CORS_ALLOWED_ORIGINS` | `http://IP_PUBLICA:3000,http://IP_PUBLICA:3001` |
| `PASSWORD_RESET_URL` | `http://IP_PUBLICA:3001/reset-password` |
| `NEXT_PUBLIC_TALENT_API_URL` | URL base HTTPS de la API publica de candidaturas, sin `/records`. La API debe permitir CORS desde `http://IP_PUBLICA:3001`. |
| `NEXT_PUBLIC_AUTH_API_URL` | `http://IP_PUBLICA:8000` |
| `NEXT_PUBLIC_API_BASE_URL` | `http://IP_PUBLICA:8000` |

Reemplaza `IP_PUBLICA` por la IP real. Las variables `NEXT_PUBLIC_*` se incorporan al bundle del backoffice durante el build; si cambian, hay que reconstruirlo.

### 2. Construir y arrancar

```bash
docker compose --env-file .env.production up -d --build
docker compose --env-file .env.production ps
```

Consulta los logs con `docker compose --env-file .env.production logs -f`. Prueba `http://IP_PUBLICA:3000`, `http://IP_PUBLICA:3001` y `http://IP_PUBLICA:8000/health`.

### 3. Red de DigitalOcean

Permite TCP entrante a `3000`, `3001` y `8000` en el firewall de la VPS. Si el Droplet tiene un **Cloud Firewall** asociado en el panel de DigitalOcean, agrega tambien esas reglas alli; si no tiene uno, no hay una segunda regla de proveedor que configurar. No abras puertos PostgreSQL (5432) entrantes.

### Datos persistentes y actualizaciones

Compose crea volumenes `auth-data`, `incidents-data` y `suppliers-data`; sobreviven a recrear contenedores. Una clonacion nueva empieza con esas bases JSON vacias. `docker compose down` conserva los volumenes; **no** uses `docker compose down -v`, porque los elimina.

Para desplegar cambios posteriores:

```bash
git pull
docker compose --env-file .env.production up -d --build
```

Antes de una demostracion importante, respalda los volumenes JSON y la base Supabase. Los archivos que ya existan en una computadora local no se copian al clonar; solo estarian disponibles en la VPS si se exportan/restauran por separado.

## Notas

- El endpoint de la API se publica en el puerto `8000` porque algunas pantallas del backoffice llaman a la API directamente desde el navegador. Si se cambia, deben actualizarse las URL publicas y CORS.
- El website es independiente del backoffice y no necesita conectarse al backend en su configuracion actual.
- El sitio funciona por HTTP con la IP para una muestra. El navegador no cifrara la conexion. No pongas contrasenas o datos reales en una red publica sin HTTPS.
- No se ejecutan seeders al arrancar.
