FROM python:3.12-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir uv

EXPOSE 8000

HEALTHCHECK --interval=5s --timeout=5s --start-period=10s --retries=5 \
	CMD python -c "from urllib.request import urlopen; urlopen('http://127.0.0.1:8000/openapi.json', timeout=3)"

FROM base AS inventory

COPY services/inventory_management_API/requirements.txt /tmp/requirements.txt
RUN uv pip install --system --no-cache -r /tmp/requirements.txt
COPY services/__init__.py services/__init__.py
COPY services/inventory_management_API/ services/inventory_management_API/
COPY services/JWTauth_api/ services/JWTauth_api/
RUN mkdir -p services/JWTauth_api/data

CMD ["uvicorn", "services.inventory_management_API.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS auth

COPY services/JWTauth_api/pyproject.toml /tmp/pyproject.toml
RUN uv pip install --system --no-cache -r /tmp/pyproject.toml
COPY services/__init__.py services/__init__.py
COPY services/JWTauth_api/ services/JWTauth_api/
RUN mkdir -p services/JWTauth_api/data

CMD ["uvicorn", "services.JWTauth_api.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS incidents

COPY services/manage_incidentsAPI/requirements.txt /tmp/requirements.txt
RUN uv pip install --system --no-cache -r /tmp/requirements.txt
COPY services/__init__.py services/__init__.py
COPY services/manage_incidentsAPI/ services/manage_incidentsAPI/
COPY packages/shared/ packages/shared/

CMD ["uvicorn", "services.manage_incidentsAPI.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS suppliers

COPY services/suppliers_api/requirements.txt /tmp/requirements.txt
RUN uv pip install --system --no-cache -r /tmp/requirements.txt
COPY services/__init__.py services/__init__.py
COPY services/suppliers_api/ services/suppliers_api/
COPY services/JWTauth_api/ services/JWTauth_api/
RUN mkdir -p services/JWTauth_api/data /data

CMD ["uvicorn", "services.suppliers_api.main:app", "--host", "0.0.0.0", "--port", "8000"]

FROM base AS analysis

COPY services/api/requirements.txt /tmp/requirements.txt
RUN uv pip install --system --no-cache -r /tmp/requirements.txt
COPY services/__init__.py services/__init__.py
COPY services/api/ services/api/
COPY services/incidents/ services/incidents/

CMD ["uvicorn", "services.api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]