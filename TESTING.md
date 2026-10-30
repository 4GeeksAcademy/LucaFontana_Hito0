# Pruebas de autenticacion

## Ejecucion de las suites

Las pruebas del backend usan los fixtures aislados de TinyDB ubicados en `services/JWTauth_api/tests`:

```bash
cd services/JWTauth_api
uv sync
uv run pytest
uv run pytest --cov
```

Las utilidades de autenticacion del frontend y el guard compartido viven en `packages/shared/auth` y son consumidos por el portal unificado. Ejecuta Jest desde la raiz del repositorio:

```bash
cd /workspaces/LucaFontana_Hito0
corepack pnpm install --frozen-lockfile
corepack pnpm test
```

Para ejecutar las pruebas frontend con cobertura:

```bash
corepack pnpm run test:coverage
```

El comando equivalente usando Jest directamente es:

```bash
corepack pnpm exec jest --config jest.config.cjs --coverage
```

La configuracion real de Jest es `jest.config.cjs`. Las pruebas cubren `packages/shared/auth`, incluido `SharedAuthGuard`; ya no importan componentes de las aplicaciones retiradas.

Los proyectos de UI conservan sus comprobaciones normales de lint:

```bash
corepack pnpm --filter backoffice-portal lint
```

Las pruebas nunca abren `services/JWTauth_api/data/db.json`; cada prueba del backend sustituye las tablas TinyDB importadas por tablas temporales en memoria.

## Matriz de pruebas

| Area | Camino feliz | Casos limite | Modos de fallo |
| --- | --- | --- | --- |
| Registro en `services/JWTauth_api/services.py` | Crea un usuario normalizado y un perfil con contraseña cifrada | Email con mayusculas y espacios; contraseña larga y con caracteres especiales | Email normalizado duplicado; rollback cuando falla la creacion del perfil |
| `auth.login` | Credenciales validas producen un token bearer | Se rechazan contraseñas vacias o solo con espacios; se rechazan usuarios inactivos | Email desconocido, email valido con contraseña incorrecta, email mal formado |
| `auth.create_access_token` / `get_current_user` | Un token vigente resuelve a su usuario | Limite de expiracion y ausencia del claim `sub` | Token expirado, firma incorrecta, token mal formado, usuario inexistente |
| `users.create_user` | Un registro valido devuelve usuario y perfil | Campos de perfil opcionales omitidos; email con caracteres especiales | Email invalido, contraseña vacia, email duplicado |
| Almacenamiento compartido de tokens | El token del navegador se puede guardar, leer y eliminar | Las llamadas del servidor funcionan sin `window` | No queda un token antiguo despues de eliminarlo |
| Cliente compartido de la API de autenticacion | El login y las peticiones protegidas adjuntan el token correcto | Barra final en la URL base; errores de API sin JSON | Un 401 elimina la sesion y activa la redireccion; los errores de red se traducen |
| `SharedAuthGuard` del portal | Una sesion validada muestra el contenido privado | El contenido permanece oculto mientras se verifica la sesion | Un fallo de verificacion muestra un error y permite reintentar |

### Justificacion de los limites

El email se prueba con espacios y diferencias de mayusculas porque el servicio trata esos valores como la misma identidad. Las pruebas de contraseña incluyen valores vacios, solo espacios, largos y con puntuacion para cubrir las decisiones de validacion y el manejo de bcrypt sin depender de la serializacion HTTP. Las pruebas JWT cubren tokens expirados, manipulados, mal formados y sin claims obligatorios porque todos deben fallar antes de ejecutar logica protegida. Las tablas temporales son obligatorias porque la base de datos de desarrollo esta versionada y el orden de las pruebas no debe afectarla.

## Flujo asistido por IA

La implementacion compartida activa esta en `packages/shared/auth`, no en `packages/auth`. Tras unificar los backoffices, la suite de guards se adapto al guard compartido del portal. Las pruebas del cliente de autenticacion siguen verificando tokens, errores y respuestas no autorizadas.