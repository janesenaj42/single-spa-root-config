# File: scripts/build-keycloak-config.js

# scripts/build-keycloak-config.js

## Overview

Writes the browser-facing Keycloak client config from env vars, so the
Keycloak connection can be changed per-environment without rebuilding
the root-config image (same pattern as build-mfe-config.js).
Env vars (all required):
KEYCLOAK_URL        - e.g. http://localhost:8080 (browser-reachable)
KEYCLOAK_REALM
KEYCLOAK_CLIENT_ID

It exposes 1 public symbol.

## Public API

| Symbol | Kind | Signature |
| --- | --- | --- |
| `buildKeycloakConfig` | function | function buildKeycloakConfig(env) |

## Used by

Imported by 1 file in this repository.

**`test`**

- `test/build-keycloak-config.test.js`

## Usage Notes

**Layer:** Docs & Tooling | **Role:** internal to its layer

## Questions this page answers

- What does `scripts/build-keycloak-config.js` export?
- Where is `buildKeycloakConfig` defined?
- What imports `scripts/build-keycloak-config.js`?

## In the code

url realm node:fs node:path node:url KEYCLOAK_URL KEYCLOAK_REALM KEYCLOAK_CLIENT_ID dist keycloak.json writes the browser facing keycloak client config from env vars connection can changed per environment without rebuilding root image same pattern build mfe all required http localhost reachable import node path file function require name const value throw new error missing var for json generation return export main process argv meta dirname output join mkdir sync recursive true write stringify null console log wrote

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*