# File: scripts/build-mfe-config.js

# scripts/build-mfe-config.js

## Overview

Merges one YAML file per microfrontend into a single mfes.json manifest
that root-config.js fetches at runtime.
Env vars:
MFE_CONFIG_DIR  - directory of *.yaml files (default: ../mfes)
MFE_OUTPUT_FILE - where to write the merged JSON (default: ../dist/mfes.json)

It exposes 2 public symbols.

## Public API

| Symbol | Kind | Signature |
| --- | --- | --- |
| `validateAndNormalize` | function | function validateAndNormalize(raw, filename) |
| `loadConfigs` | function | function loadConfigs(dir) |

## Used by

Imported by 1 file in this repository.

**`test`**

- `test/build-mfe-config.test.js`

## Usage Notes

**Layer:** Docs & Tooling | **Role:** internal to its layer

## Questions this page answers

- What does `scripts/build-mfe-config.js` export?
- Where is `validateAndNormalize` defined?
- What imports `scripts/build-mfe-config.js`?

## In the code

name entry container public raw node:fs node:path node:url js-yaml ajv object activeWhen string array boolean #app .yaml .yml utf8 ${app.name} mfes dist mfes.json If true, the app is mounted regardless of auth state (e.g. a shell navbar). If false/omitted, the app only activates for an authenticated user, and only if the user holds at least one of requiredRoles (when specified). merges one yaml file per microfrontend into single json manifest that root config fetches runtime env vars mfe dir directory files default output where write the merged import from node path url const dirname meta new all errors true validate schema compile type additional properties false required active when min length items app mounted regardless auth state shell navbar omitted only activates for authenticated user and holds least roles specified custom props validates parsed document against returns normalized defaults applied throws violations filename used make error messages traceable source export function normalize details text separator throw invalid return load configs exists sync not found readdir filter ends with yml sort console warn warning seen names set apps full join let try read catch

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*