# Informe de auditoría del manejo de errores

## CRÍTICO

1. [services/JWTauth_api/auth.py](services/JWTauth_api/auth.py#L213-L226) — Categoría: EXPOSICIÓN DE ERRORES SIN SANITIZAR
   - Problema: `ValidationError.errors()` se devuelve directamente como cuerpo de la respuesta HTTP de `/auth/login`; esto expone al cliente detalles internos de la validación de Pydantic (rutas de campos y detalles del esquema).
   - Solución sugerida: Devolver un mensaje sanitizado y seguro para el usuario, como `"Correo electrónico o contraseña inválidos"`, o un mapa mínimo de errores por campo, en lugar de exponer los metadatos de validación sin procesar.

2. [uis/backoffices/suppliers_tinydb/lib/suppliersApi.ts](uis/backoffices/suppliers_tinydb/lib/suppliersApi.ts#L31-L45) — Categoría: EXPOSICIÓN DE ERRORES SIN SANITIZAR
   - Problema: `proxyErrorResponse()` reenvía `error.message` literalmente al navegador. Cuando falla la petición ascendente, esto puede filtrar detalles del transporte, nombres de host internos o mensajes derivados del stack a la interfaz.
   - Solución sugerida: Normalizar los fallos ascendentes a un mensaje público controlado, por ejemplo `"No se pudo contactar la API de proveedores."`, y registrar el error interno completo únicamente en el servidor.

3. [uis/backoffices/suppliers_tinydb/app/api/suppliers/route.ts](uis/backoffices/suppliers_tinydb/app/api/suppliers/route.ts#L4-L49) — Categoría: EXPOSICIÓN DE ERRORES SIN SANITIZAR
   - Problema: El bloque `catch` de la ruta envuelve cualquier fallo del backend y devuelve el `error.message` sin procesar mediante `proxyErrorResponse(error)`, exponiendo detalles de implementación al cliente, especialmente ante fallos de `fetch` o de análisis JSON.
   - Solución sugerida: Gestionar por separado los fallos de `fetch` y el JSON inválido, ocultar el mensaje público y conservar los diagnósticos detallados en logs o telemetría exclusiva del servidor.

## ALTO

4. [services/suppliers_api/seed.py](services/suppliers_api/seed.py#L32-L61) — Categoría: FALTA `sys.exit` AL FALLAR EL SCRIPT
   - Problema: El script termina mediante `main()` sin un código de retorno explícito ni `sys.exit`, por lo que un fallo crítico al cargar datos puede finalizar con código 0 o no proporcionar una señal clara de fallo a la automatización.
   - Solución sugerida: Hacer que `main()` devuelva un código entero y llamar a `raise SystemExit(main())`; tratar los fallos de base de datos o validación como salidas explícitas distintas de cero.

5. [packages/shared/auth/apiClient.ts](packages/shared/auth/apiClient.ts#L160-L172) — Categoría: FALLOS SILENCIOSOS
   - Problema: `extractErrorMessage()` captura los errores de análisis JSON con un bloque `catch {}` vacío y después devuelve `null`, ocultando el fallo sin ningún log ni contexto alternativo.
   - Solución sugerida: Registrar el fallo de análisis en nivel debug y devolver un mensaje genérico como `"Respuesta no válida del servidor"` en lugar de ocultar el problema silenciosamente.

6. [uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx](uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L63-L98) — Categoría: FALLOS SILENCIOSOS
   - Problema: `response.json().catch(() => null)` suprime los errores de análisis JSON y el código después lanza un error genérico, ocultando si el servidor respondió con un error estructurado o con un payload malformado.
   - Solución sugerida: Tratar el JSON malformado como un estado de fallo diferenciado y visible para el usuario, mostrando un mensaje alternativo seguro; no convertir silenciosamente el payload en `null`.

7. [uis/backoffices/administrar_incidentes/app/page.tsx](uis/backoffices/administrar_incidentes/app/page.tsx#L18-L35) — Categoría: FALTA `TRY/CATCH`
   - Problema: `request()` ejecuta `await response.json()` antes de comprobar `response.ok`, y la ruta de análisis JSON/llamada no está protegida; una respuesta 500, un timeout o una respuesta malformada que no sea JSON puede hacer que el componente falle en lugar de entrar correctamente en el estado de error capturado.
   - Solución sugerida: Proteger el análisis JSON con un `try/catch` dedicado, validar el tipo de contenido de la respuesta y convertir los payloads inesperados en un objeto de error controlado antes de renderizarlos.

8. [services/JWTauth_api/auth.py](services/JWTauth_api/auth.py#L189-L215) — Categoría: FILTRACIONES DE DATOS SENSIBLES
   - Problema: La ruta de fallo de Resend registra el cuerpo de respuesta sin procesar del proveedor (`error.read()[:500]`) y los metadatos del error, que pueden incluir identificadores de solicitudes, direcciones o contenido generado por el proveedor que no debería aparecer en los logs del servidor.
   - Solución sugerida: Registrar únicamente un código de estado ocultando datos sensibles y un resumen sanitizado y truncado; evitar cuerpos de respuesta completos o contenido de emails proporcionado por usuarios en los logs.

9. [uis/backoffices/analizador_incidentes/app/api/incidents/analyze/route.ts](uis/backoffices/analizador_incidentes/app/api/incidents/analyze/route.ts#L3-L19) — Categoría: EXPOSICIÓN DE ERRORES SIN SANITIZAR
   - Problema: La ruta captura todos los fallos ascendentes y devuelve un mensaje `detail` genérico, pero la ruta `response.text()` también puede replicar directamente payloads del proveedor o del backend sin sanitizar el tipo de contenido ni el payload, lo que puede filtrar detalles internos en respuestas que no sean JSON.
   - Solución sugerida: Analizar y sanitizar los payloads ascendentes antes de reutilizarlos y normalizar las respuestas no JSON o malformadas en un único contrato de error público.

## MEDIO

10. [services/JWTauth_api/auth.py](services/JWTauth_api/auth.py#L160-L176) — Categoría: CAPTURA DEMASIADO AMPLIA
   - Problema: `except (JWTError, ValueError): raise credentials_exception` captura todos los problemas de decodificación JWT en un único grupo y vuelve a lanzar un 401 genérico, pero no distingue entre un token malformado y uno expirado, haciendo que el mecanismo sea menos preciso y más difícil de diagnosticar.
   - Solución sugerida: Separar, cuando sea posible, los fallos por token malformado y token expirado, y registrar cada categoría por separado manteniendo genérica la respuesta pública.

11. [services/JWTauth_api/services.py](services/JWTauth_api/services.py#L62-L71) — Categoría: CAPTURA DEMASIADO AMPLIA
   - Problema: `create_user_with_profile()` envuelve la inserción del perfil en `except Exception:` y después elimina el registro de usuario; esta captura amplia para hacer rollback puede ocultar errores no relacionados de base de datos o serialización y dificultar la depuración.
   - Solución sugerida: Capturar únicamente las excepciones específicas de base de datos/inserción esperadas durante la creación del perfil, registrar el fallo preciso y volver a lanzar un error de aplicación controlado si el rollback no puede completarse.

12. [services/manage_incidentsAPI/main.py](services/manage_incidentsAPI/main.py#L23-L28) — Categoría: CAPTURA DEMASIADO AMPLIA
   - Problema: El `@app.exception_handler(Exception)` global captura cualquier excepción de la API de incidentes y la reduce a una única respuesta 500, lo que impide gestionar con precisión los fallos de validación, E/S y base de datos, además de ocultar la causa raíz en producción.
   - Solución sugerida: Sustituir el manejador universal por manejadores específicos para errores de validación, base de datos y E/S, reservando el fallback 500 para condiciones realmente inesperadas.

## BAJO

13. [uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx](uis/backoffices/analizador_incidentes/components/IncidentAnalyzer.tsx#L72-L117) — Categoría: SIN ACCIÓN PARA EL USUARIO
   - Problema: El estado de error muestra un mensaje, pero solo ofrece texto; no existe un botón explícito de reintento ni una acción de recuperación cuando falla el flujo de análisis/descarga.
   - Solución sugerida: Añadir una acción de reintento (`Reintentar análisis` / `Reintentar descarga`) y una ruta clara de recuperación cuando el backend no esté disponible o la carga sea inválida.

14. [uis/backoffices/administrar_incidentes/app/page.tsx](uis/backoffices/administrar_incidentes/app/page.tsx#L31-L44) — Categoría: FALTAN ESTADOS DE CARGA/ERROR EN LA INTERFAZ
   - Problema: La página establece `listError` y `summaryError` cuando falla una petición, pero el helper de fetch lanza objetos de estructura sin procesar y no existe un estado vacío/de error específico para la lista principal cuando falla la carga inicial; por ello, los usuarios pueden llegar a un dashboard vacío sin información útil ni una acción disponible.
   - Solución sugerida: Renderizar un panel de estado vacío explícito con controles de reintento y una sección independiente para el fallo de carga, en lugar de dejar el dashboard en blanco.

15. [services/JWTauth_api/auth.py](services/JWTauth_api/auth.py#L218-L226) — Categoría: FALLOS SILENCIOSOS
   - Problema: `_send_reset_email_safely()` captura `URLError` y `TimeoutError`, registra el error y después retorna sin informar del éxito o fallo al consumidor de la API, haciendo que el flujo de restablecimiento parezca exitoso aunque el email nunca se haya enviado.
   - Solución sugerida: Devolver un estado controlado de la API, por ejemplo `503` o un mensaje seguro, cuando el proveedor de email no esté disponible o, como mínimo, distinguir entre los estados `"email en cola"` y `"falló la entrega del email"`.

Resumen: El repositorio ya cuenta con una base más sólida en algunas páginas frontend, con estados explícitos de carga y error, pero varias rutas críticas todavía filtran detalles internos, suprimen fallos sin trazabilidad y no ofrecen acciones claras de recuperación ante interrupciones reales o respuestas de servidor inválidas.
