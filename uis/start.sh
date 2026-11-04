#!/bin/sh
set -e

echo "Starting website on port 3000..."
corepack pnpm --dir /app/uis/website dev --hostname 0.0.0.0 --port 3000 &
WEBSITE_PID=$!

echo "Starting backoffice portal on port 3001..."
corepack pnpm --dir /app/uis/backoffices/portal dev --hostname 0.0.0.0 --port 3001 &
PORTAL_PID=$!

trap 'kill $WEBSITE_PID $PORTAL_PID' INT TERM

wait