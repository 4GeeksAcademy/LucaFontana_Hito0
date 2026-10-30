FROM node:22-alpine

WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la cache de Docker.
COPY website/package*.json ./website/
COPY backoffices/administrar_inventario/package*.json ./backoffices/administrar_inventario/
COPY backoffices/administrar_incidentes/package*.json ./backoffices/administrar_incidentes/
COPY backoffices/analizador_incidentes/package*.json ./backoffices/analizador_incidentes/
COPY backoffices/suppliers_tinydb/package*.json ./backoffices/suppliers_tinydb/
COPY backoffices/portal/package*.json ./backoffices/portal/
COPY talent-pipeline-tracker/package*.json ./talent-pipeline-tracker/


# Instalamos las dependencias de cada aplicación por separado.
RUN npm install --prefix ./website
RUN npm install --prefix ./backoffices/administrar_inventario
RUN npm install --prefix ./backoffices/administrar_incidentes
RUN npm install --prefix ./backoffices/analizador_incidentes
RUN npm install --prefix ./backoffices/suppliers_tinydb
RUN npm install --prefix ./backoffices/portal
RUN npm install --prefix ./talent-pipeline-tracker

# Ahora copiamos el resto del código.
COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["sh", "/app/start.sh"]