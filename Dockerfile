# ---- deps: runtime-only node_modules (js-yaml) for the config-merge script ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- build: bundle root-config.js with esbuild ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:js

# ---- runtime: nginx serving the bundle, node available to regenerate mfes.json ----
FROM node:20-alpine
RUN apk add --no-cache nginx
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY --from=build /app/dist /usr/share/nginx/html
COPY scripts/build-mfe-config.js ./scripts/build-mfe-config.js
COPY scripts/build-keycloak-config.js ./scripts/build-keycloak-config.js
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && \
    mkdir -p /run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/lib/nginx /var/log/nginx /run/nginx

ENV MFE_CONFIG_DIR=/config/mfes
ENV MFE_OUTPUT_FILE=/usr/share/nginx/html/mfes.json
ENV KEYCLOAK_OUTPUT_FILE=/usr/share/nginx/html/keycloak.json
# KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID are required and have no
# defaults - the container fails fast at startup if they're not supplied.

# Non-root: Trivy flagged the missing USER directive (DS-0002). 8080, not
# 80, since binding <1024 needs root.
USER nginx
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
