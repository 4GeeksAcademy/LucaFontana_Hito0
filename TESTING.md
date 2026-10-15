# Pruebas de autenticacion

## Ejecucion de las suites

Las pruebas del backend usan los fixtures aislados de TinyDB ubicados en `services/JWTauth_api/tests`:

```bash
cd services/JWTauth_api
uv sync
uv run pytest
uv run pytest --cov
```

Las utilidades de autenticacion del frontend viven en `packages/shared/auth` y son consumidas por las dos aplicaciones Next.js. Ejecuta Jest desde la raiz del repositorio, no desde una de las carpetas de UI:

```bash
cd /workspaces/LucaFontana_Hito0
npm install
npm test
```

Para ejecutar las pruebas frontend con cobertura:

```bash
npm run test:coverage
```

El comando equivalente usando Jest directamente es:

```bash
npx jest --config jest.config.cjs --coverage
```

La configuracion real de Jest es `jest.config.cjs`. Las pruebas cubren `packages/shared/auth` y los componentes `AuthGuard` de ambas aplicaciones.

Los proyectos de UI conservan sus comprobaciones normales de lint:

```bash
cd uis/backoffices/analizador_incidentes && npm run lint
cd ../suppliers_tinydb && npm run lint
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
| `AuthGuard` de `analizador_incidentes` | Una ruta privada muestra el contenido para usuarios autenticados | Las rutas publicas se muestran durante la carga o sin sesion | Un usuario sin sesion es redirigido a `/login` |
| `AuthGuard` de `suppliers_tinydb` | Una ruta privada muestra el contenido para usuarios autenticados | Las rutas publicas se muestran durante la carga o sin sesion | Un usuario sin sesion es redirigido a `/login` |

### Justificacion de los limites

El email se prueba con espacios y diferencias de mayusculas porque el servicio trata esos valores como la misma identidad. Las pruebas de contraseña incluyen valores vacios, solo espacios, largos y con puntuacion para cubrir las decisiones de validacion y el manejo de bcrypt sin depender de la serializacion HTTP. Las pruebas JWT cubren tokens expirados, manipulados, mal formados y sin claims obligatorios porque todos deben fallar antes de ejecutar logica protegida. Las tablas temporales son obligatorias porque la base de datos de desarrollo esta versionada y el orden de las pruebas no debe afectarla.

## Flujo asistido por IA

Durante el diseño de la suite, una inspeccion asistida por IA comprobo que el repositorio no contiene el directorio solicitado `packages/auth`: la implementacion compartida activa esta en `packages/shared/auth` y es importada por las dos aplicaciones Next.js. El plan se ajusto para probar ese limite real y los dos guards duplicados. La misma inspeccion detecto que el registro validaba el email pero aceptaba una contraseña vacia; se añadio una prueba de regresion y se reforzo el modelo de entrada en lugar de ocultar el comportamiento en un fixture.