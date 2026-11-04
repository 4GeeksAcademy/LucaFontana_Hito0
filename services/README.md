# `services` folder

This folder contains **all the backend services** (APIs and background workers) related to the company for the cross-functional AI Engineering project.

Each subfolder inside `services/` must correspond to **one specific service** (for example: `admin-api`, `data-processor-worker`) and include its own technical and functional documentation.

- **Main purpose**: to centralize all the backend logic, APIs, and queue consumers that support the company's use cases.
- **Recommendation**: document in this file (or in sub-READMEs) the services you add, their objective, the technology used, and how to run them.

## Unified Brasaland backend

The authentication, inventory, suppliers, incident-management, and CSV-analysis APIs are registered in one FastAPI application. Start the entire backend from the repository root with:

```bash
myenv/bin/uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000
```

All endpoints become available at the same time on port `8000`; interactive API documentation is at `http://localhost:8000/docs`. Do not start each domain as a separate server for the unified workflow.

> _Spanish version: [README.es.md](./README.es.md)._
