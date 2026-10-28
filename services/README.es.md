# Carpeta `services`

Esta carpeta contiene **todos los servicios backend** (APIs y workers en segundo plano) relacionados con la compañía para el proyecto transversal de AI Engineering.

Cada subcarpeta dentro de `services/` debe corresponder a **un servicio concreto** (por ejemplo `admin-api`, `data-processor-worker`) e incluir su propia documentación técnica y funcional.

- **Propósito principal**: centralizar toda la lógica backend, APIs y consumidores de colas que dan soporte a los casos de uso de la compañía.
- **Recomendación**: documenta en este archivo (o en sub-READMEs) los servicios que vayas añadiendo, su objetivo, tecnología usada y cómo ejecutarlos.

## Backend Brasaland unificado

Las APIs de autenticación, inventario, proveedores, gestión de incidencias y análisis CSV se registran en una única aplicación FastAPI. Inicia todo el backend desde la raíz del repositorio con:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

Todos los endpoints quedan disponibles simultáneamente en el puerto `8000`; la documentación se encuentra en `http://localhost:8000/docs`. No inicies las aplicaciones de cada dominio en puertos separados para el flujo unificado.
