# Portal de backoffices

El portal ofrece un punto de entrada para las aplicaciones de `uis/backoffices` y `uis/talent-pipeline-tracker`.

Las aplicaciones comparten una barra superior con acceso al menú de aplicaciones, perfil y cierre de sesión. El perfil común está disponible en `/proveedores/account/profile`; desde allí se puede editar la información de usuario y cambiar la contraseña.

## Desarrollo

Sin Docker, desde la raíz del repositorio:

```bash
corepack pnpm --filter backoffice-portal dev
```

El portal sirve directamente `/incidentes`, `/talent-pipeline-tracker` (incluidas las fichas de candidatos), `/analizador-incidentes`, `/inventario` y `/proveedores` desde `http://localhost:3001`. Todas las interfaces de backoffice corren en un solo proceso Next.js; ya no requieren servidores en los puertos `3101` a `3105`. El backend unificado se inicia por separado en el puerto `8000`.

El website independiente se sirve en `http://localhost:3000`.

En desarrollo, desde la raíz del repositorio, ejecuta `sh uis/start.sh` para iniciar el website y el backoffice en los puertos `3000` y `3001`. Docker usa el lockfile pnpm de la raíz, no los lockfiles npm antiguos.

Para desplegar ambas interfaces y el backend unificado en una VPS, sigue [DEPLOY.md](../../../DEPLOY.md).

### API de Talent tracker

Configura `NEXT_PUBLIC_TALENT_API_URL` en `uis/backoffices/portal/.env.local` con el mismo valor que tenía `NEXT_PUBLIC_API_URL` en el tracker original. Debe ser la URL base de su API de candidaturas, accesible desde el navegador; el cliente agrega `/records` y las rutas de notas.

Por compatibilidad, se acepta `NEXT_PUBLIC_API_URL` si no se define la variable específica. El portal no carga el archivo de entorno de la aplicación original. Reinicia el servidor tras configurar la variable; para producción, debe estar definida antes del build.

La implementación activa del tracker vive dentro del portal; no requiere imports ni servidores de `uis/talent-pipeline-tracker`.

## Rutas

- `/` — índice protegido de aplicaciones.
- `/inventario` — administración de inventario.
- `/inventario/backoffice/inventory/products` — productos y existencias.
- `/inventario/backoffice/inventory/orders/inbound` y `/inventario/backoffice/inventory/orders/outbound` — registro de entradas y salidas; conservan el parámetro opcional `productId`.
- `/inventario/backoffice/inventory/orders` — historial de movimientos.
- `/incidentes` — administración de incidentes.
- `/analizador-incidentes` — análisis de archivos de incidencias.
- `/analizador-incidentes/incidents` — carga de CSV, análisis y exportación.
- `/analizador-incidentes/account/profile` y `/analizador-incidentes/account/change-password` — perfil y contraseña del analizador con la sesión compartida.
- `/proveedores` — directorio de proveedores.
- `/proveedores/account/profile` y `/proveedores/account/change-password` — perfil y contraseña con la sesión compartida.
- `/talent-pipeline-tracker` — seguimiento de candidaturas.
- `/login`, `/register`, `/forgot-password` y `/reset-password` — acceso y gestión centralizados de cuenta.

El portal reutiliza el token `auth_token` almacenado en `localStorage` por los backoffices existentes. Las consultas de perfil de sesión se deduplican y se guardan en memoria durante 2 minutos; cerrar sesión, cambiar el token, recibir un `401` o actualizar el perfil invalida esa caché. Las pantallas se protegen en el cliente; los servicios API conservan sus propios puertos y controles y deben validar cada operación protegida.

Proveedores usa `/api/suppliers`, `/api/suppliers/rate` y `/api/suppliers/status` en el mismo puerto del portal. El servidor reenvía las peticiones a `SUPPLIERS_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`; también se acepta `NEXT_PUBLIC_SUPPLIERS_API_URL` como alternativa). Configura la variable en el entorno del portal si necesitas otro backend y reinícialo. Las rutas antiguas bajo `/proveedores/api/suppliers` siguen disponibles. Se conservan el directorio, filtros, búsqueda por id, altas, bajas, tarifas y estados; el login, registro y recuperación utilizan las pantallas centrales.

Inventario usa el contexto de autenticación del portal y `/api/inventory/` en el mismo puerto. El servidor reenvía las peticiones a `INVENTORY_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`). Configura esa variable en el entorno del portal si necesitas otro backend. Se conservan las rutas antiguas `/inventario/api/inventory/`. El catálogo y su stock se reutilizan en memoria por cinco minutos y se invalida al registrar entradas o salidas; las salidas siguen siendo validadas por el servidor al guardar.

El analizador usa `/api/incidents/analyze` y `/api/incidents/results/export` en el mismo puerto del portal. El servidor reenvía estas peticiones a `INCIDENTS_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`). Si necesitas otra dirección, configura esa variable en el entorno del portal y reinícialo. Las rutas antiguas bajo `/analizador-incidentes/api/incidents/` siguen disponibles.

Para que los enlaces de recuperación abran el formulario central, configura `PASSWORD_RESET_URL` con la URL pública del portal más `/reset-password` (por ejemplo, `http://localhost:3000/reset-password` en desarrollo).
