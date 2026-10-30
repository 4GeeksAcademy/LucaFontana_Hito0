# Portal de backoffices

El portal ofrece un punto de entrada para las aplicaciones de `uis/backoffices` y `uis/talent-pipeline-tracker`.

## Desarrollo

Sin Docker, desde la raíz del repositorio:

```bash
corepack pnpm --filter backoffice-portal dev
```

El portal sirve directamente `/incidentes`, `/talent-pipeline-tracker` (incluidas las fichas de candidatos), `/analizador-incidentes`, `/inventario` y `/proveedores` desde `http://localhost:3000`. Todas las interfaces de backoffice corren en un solo proceso Next.js; ya no requieren servidores en los puertos `3101` a `3105`. El backend se inicia por separado.

Las aplicaciones originales se conservan durante la migración, pero no es necesario iniciarlas.

El script `uis/start.sh` usa rutas de contenedor (`/app`): inicia únicamente el portal y el website por separado en `http://localhost:3001`.

Al usar Docker Compose, solo el puerto `3000` queda publicado para el portal de backoffices. El website conserva el puerto `3001`.

### API de Talent tracker

Configura `NEXT_PUBLIC_TALENT_API_URL` en `uis/backoffices/portal/.env.local` con el mismo valor que tenía `NEXT_PUBLIC_API_URL` en el tracker original. Debe ser la URL base de su API de candidaturas, accesible desde el navegador; el cliente agrega `/records` y las rutas de notas.

Por compatibilidad, se acepta `NEXT_PUBLIC_API_URL` si no se define la variable específica. El portal no carga el archivo de entorno de la aplicación original. Reinicia el servidor tras configurar la variable; para producción, debe estar definida antes del build.

La aplicación original de `uis/talent-pipeline-tracker` se conserva sin cambios, pero ya no hace falta iniciarla para acceder al tracker desde el portal.

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

El portal reutiliza el token `auth_token` almacenado en `localStorage` por los backoffices existentes. Las pantallas se protegen en el cliente; los servicios API conservan sus propios puertos y controles.

Proveedores usa `/api/suppliers`, `/api/suppliers/rate` y `/api/suppliers/status` en el mismo puerto del portal. El servidor reenvía las peticiones a `SUPPLIERS_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`; también se acepta `NEXT_PUBLIC_SUPPLIERS_API_URL` como alternativa). Configura la variable en el entorno del portal si necesitas otro backend y reinícialo. Las rutas antiguas bajo `/proveedores/api/suppliers` siguen disponibles. Se conservan el directorio, filtros, búsqueda por id, altas, bajas, tarifas y estados; el login, registro y recuperación utilizan las pantallas centrales.

Inventario usa el contexto de autenticación del portal y `/api/inventory/` en el mismo puerto. El servidor reenvía las peticiones a `INVENTORY_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`). Configura esa variable en el entorno del portal si necesitas otro backend. Se conservan las rutas antiguas `/inventario/api/inventory/` y la aplicación original, pero ya no hace falta iniciarla.

El analizador usa `/api/incidents/analyze` y `/api/incidents/results/export` en el mismo puerto del portal. El servidor reenvía estas peticiones a `INCIDENTS_API_BASE_URL` (por defecto, `http://127.0.0.1:8000`). Si necesitas otra dirección, configura esa variable en el entorno del portal y reinícialo. Las rutas antiguas bajo `/analizador-incidentes/api/incidents/` siguen disponibles. La aplicación original del analizador se conserva sin cambios.

Para que los enlaces de recuperación abran el formulario central, configura `PASSWORD_RESET_URL` con la URL pública del portal más `/reset-password` (por ejemplo, `http://localhost:3000/reset-password` en desarrollo).
