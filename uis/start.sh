#!/bin/sh
set -e

echo "Starting backoffices/administrar_inventario on port 3000..."
npm --prefix /app/backoffices/administrar_inventario run dev -- --hostname 0.0.0.0 --port 3000 &
BACKOFFICE_PID=$!

echo "Starting website on port 3001..."
npm --prefix /app/website run dev -- --hostname 0.0.0.0 --port 3001 &
WEBSITE_PID=$!

echo "Starting backoffices/administrar_incidentes on port 3002..."
npm --prefix /app/backoffices/administrar_incidentes run dev -- --hostname 0.0.0.0 --port 3002 &
INCIDENTS_PID=$!

echo "Starting backoffices/analizador_incidentes on port 3003..."
npm --prefix /app/backoffices/analizador_incidentes run dev -- --hostname 0.0.0.0 --port 3003 &
ANALYZER_PID=$!

echo "Starting backoffices/suppliers_tinydb on port 3004..."
npm --prefix /app/backoffices/suppliers_tinydb run dev -- --hostname 0.0.0.0 --port 3004 &
SUPPLIERS_PID=$!

trap 'kill $WEBSITE_PID $BACKOFFICE_PID $INCIDENTS_PID $ANALYZER_PID $SUPPLIERS_PID' INT TERM

wait