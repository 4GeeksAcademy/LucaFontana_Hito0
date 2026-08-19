# Deploy Local - Suppliers API

## 1) Activar entorno virtual myenv

Si no existe el entorno virtual:

```bash
python -m venv myenv
```

Activarlo en Linux/macOS:

```bash
source myenv/bin/activate
```

Verificar que quedo activo:

```bash
which python
```

## 2) Instalar dependencias

Desde esta carpeta (`services/suppliers_api`), instala con requirements:

```bash
pip install -r requirements.txt
```

Dependencias principales del backend:

- fastapi
- uvicorn[standard]
- tinydb
- pydantic

Si quieres instalarlas manualmente:

```bash
pip install "fastapi>=0.116,<1.0" "uvicorn[standard]>=0.35,<1.0" "tinydb>=4.8,<5.0" "pydantic>=2.9,<3.0"
```

## 3) Encender servidor backend

Desde la raiz del repo:

```bash
uvicorn services.suppliers_api.main:app --host 127.0.0.1 --port 8000 --reload
```

O desde /services/suppliers_api/

```bash
uvicorn main:app --reload
```

Healthcheck:

```bash
curl http://127.0.0.1:8000/health
```

La API de proveedores queda disponible en:

- http://127.0.0.1:8000/suppliers
