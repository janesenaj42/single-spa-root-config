#!/bin/sh
set -e

echo "Generating MFE config from ${MFE_CONFIG_DIR}..."
node /app/scripts/build-mfe-config.js

echo "Starting nginx..."
exec nginx -g "daemon off;"
