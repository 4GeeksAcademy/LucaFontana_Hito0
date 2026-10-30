#!/bin/sh
set -e

echo "Starting backoffice portal on port 3000..."
npm --prefix /app/backoffices/portal run dev -- --hostname 0.0.0.0 --port 3000 &
PORTAL_PID=$!

echo "Starting website on port 3001..."
npm --prefix /app/website run dev -- --hostname 0.0.0.0 --port 3001 &
WEBSITE_PID=$!

trap 'kill $WEBSITE_PID $PORTAL_PID' INT TERM

wait