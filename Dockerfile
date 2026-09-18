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
# Base image's baked-in Alpine package snapshot can lag behind what's
# actually available (openssl 3.5.6-r0 when 3.5.7/3.5.8 already fix known
# CVEs) - explicit upgrade instead of trusting the snapshot.
RUN apk update && apk upgrade --no-cache && apk add --no-cache nginx
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
COPY --from=build /app/dist /usr/share/nginx/html
COPY scripts/build-mfe-config.js ./scripts/build-mfe-config.js
COPY scripts/build-keycloak-config.js ./scripts/build-keycloak-config.js
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY bootstrap.js ./bootstrap.js
RUN mkdir -p /run/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html /var/lib/nginx /var/log/nginx /run/nginx

# Last shell-dependent step: everything below this needs to already be in
# place, since after it /bin/sh no longer exists in the image.
#
# npm/npx/corepack are never invoked at runtime (only `node` and `nginx`
# are) - removing them drops ~20 Trivy findings in npm's own bundled deps
# (tar, minimatch, glob, etc.) that describe risk in code this image never
# executes.
#
# busybox (provides /bin/sh and every other shell utility) goes too, since
# bootstrap.js replaces entrypoint.sh and nginx doesn't need a shell either
# - runtime-tested with no shell present at all. Collecting every busybox
# symlink into one variable before a single `rm` call matters: `rm` is
# itself one of those symlinks, so deleting it via N separate `rm`
# invocations breaks after the first one removes /bin/rm out from under
# the remaining calls.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack && \
    targets= && \
    for f in /bin/* /sbin/* /usr/bin/* /usr/sbin/*; do \
      if [ -L "$f" ]; then case "$(readlink "$f")" in *busybox*) targets="$targets $f" ;; esac; fi; \
    done && \
    rm -f $targets /bin/busybox

ENV MFE_CONFIG_DIR=/config/mfes
ENV MFE_OUTPUT_FILE=/usr/share/nginx/html/mfes.json
ENV KEYCLOAK_OUTPUT_FILE=/usr/share/nginx/html/keycloak.json
# KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID are required and have no
# defaults - the container fails fast at startup if they're not supplied.

# Non-root: Trivy flagged the missing USER directive (DS-0002). 8080, not
# 80, since binding <1024 needs root.
USER nginx
EXPOSE 8080
ENTRYPOINT ["node", "bootstrap.js"]
