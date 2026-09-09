# JWTauth_api

API de autenticación (FastAPI + TinyDB) usada por los backoffices en `/uis/backoffices/*`.

## Variables de entorno (`.env`)
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `CORS_ALLOWED_ORIGINS` (opcional, lista separada por comas). Por defecto permite `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:3001` y `http://127.0.0.1:3001`.
- `RESEND_API_KEY` (requerida para entregar correos de recuperación).
- `RESEND_FROM_EMAIL` (remitente verificado en Resend; por defecto `onboarding@resend.dev`).
- `PASSWORD_RESET_URL` (URL pública de la página de recuperación).
- `PASSWORD_RESET_TOKEN_EXPIRE_MINUTES` (opcional, por defecto `30`).

Copia `.env.example` a `.env` y completa los valores. Nunca guardes una API key en el código.

## Ejecutar localmente
Corre en el puerto **8001** para no chocar con `suppliers_api` / `services/api`, que usan el 8000:

```bash
uvicorn main:app --reload --port 8001
```
