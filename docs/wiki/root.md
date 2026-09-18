# Application Root

# Application Root

`scripts` · `src`

**Language:** javascript | **Files:** 10 | **Public symbols:** 14 / 25


Covers the 10 source files in 3 directories. Does not cover code outside those directories, which is documented on its own pages.




## Overview

Application Root covers 10 javascript files across 2 directories, exposing 14 public symbols. It sits centrally in the import graph (mean PageRank 0.0211); is imported by 6 other modules.



## Files

Highest-PageRank first: the order to read them in.

- `src/root-config.js`: `src/root-config.js` is a javascript source file in the Application layer.

- `src/containers.js`: `src/containers.js` is a javascript source file in the Application layer. It exposes 2 public symbols.

- `src/eventBus.js`: Naive interim cross-MFE event bus backed by CustomEvents on an EventTarget (window in the browser). See ADR-0003 for why this exists and its known limitations. It exposes 1 public symbol.

- `src/routing.js`: `src/routing.js` is a javascript source file in the Application layer. It exposes 2 public symbols.

- `src/auth.js`: Application module auth defining initAuth, isAuthenticated, hasAnyRole. `src/auth.js` is a javascript source file in the Application layer. It exposes 6 public symbols.

- `scripts/build-keycloak-config.js`: Writes the browser-facing Keycloak client config from env vars, so the Keycloak connection can be changed per-environment without rebuilding the root-config image (same pattern as build-mfe-config.js)

- `scripts/build-mfe-config.js`: Merges one YAML file per microfrontend into a single mfes.json manifest that root-config.js fetches at runtime. Env vars: MFE_CONFIG_DIR - directory of *.yaml files (default: ../mfes) MFE_OUTPUT_FILE

- `build.js`: Application module build (2 symbols). `build.js` is a javascript source file in the Application layer.

- `commitlint.config.js`

- `eslint.config.js`










## Dependents (modules that import this)

- `public/index.html`

- `test/build-keycloak-config.test.js`

- `test/build-mfe-config.test.js`

- `test/containers.test.js`

- `test/eventBus.test.js`

- `test/routing.test.js`













## Questions this page answers
- What does Application Root do, and where does it sit in the system?
- Which files make up Application Root (under `scripts`, `src`)?
- What relies on Application Root?
---

*Built from the code's structure. It states what is there, not why it is that
way. The explanatory prose is a separate, model-written layer.*

## Concept index

What the prose above calls things, the identifier to search for, and where it lives.

| Concept | Symbol | File |
| --- | --- | --- |
| Parse simple selector | `parseSimpleSelector` | `src/containers.js` |
| Get or create container | `getOrCreateContainer` | `src/containers.js` |
| Create event bus | `createEventBus` | `src/eventBus.js` |
| Matches active when | `matchesActiveWhen` | `src/routing.js` |
| Is app active | `isAppActive` | `src/routing.js` |
| Init auth | `initAuth` | `src/auth.js` |
| Is authenticated | `isAuthenticated` | `src/auth.js` |
| Has any role | `hasAnyRole` | `src/auth.js` |
| Get token | `getToken` | `src/auth.js` |
| Login | `login` | `src/auth.js` |
| Logout | `logout` | `src/auth.js` |
| Build keycloak config | `buildKeycloakConfig` | `scripts/build-keycloak-config.js` |
| Validate and normalize | `validateAndNormalize` | `scripts/build-mfe-config.js` |
| Load configs | `loadConfigs` | `scripts/build-mfe-config.js` |
