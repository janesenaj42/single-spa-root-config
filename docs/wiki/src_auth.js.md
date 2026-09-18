# File: src/auth.js

# src/auth.js

## Overview

Application module auth defining initAuth, isAuthenticated, hasAnyRole. `src/auth.js` is a javascript source file in the Application layer.

It exposes 6 public symbols.

## Public API

| Symbol | Kind | Signature |
| --- | --- | --- |
| `initAuth` | function | function initAuth() |
| `isAuthenticated` | function | function isAuthenticated() |
| `hasAnyRole` | function | function hasAnyRole(roles) |
| `getToken` | function | function getToken() |
| `login` | function | function login() |
| `logout` | function | function logout() |

## Used by

Imported by 1 file in this repository.

**`src`**

- `src/root-config.js`

## Usage Notes

**Layer:** Application | **Role:** internal to its layer

## Questions this page answers

- What does `src/auth.js` export?
- Where is `initAuth` defined?
- What imports `src/auth.js`?

## In the code

keycloak-js /keycloak.json no-store check-sso S256 import keycloak from let export async function init auth const res await fetch json cache store throw new error failed load status text config check sso silent redirect uri window location origin html pkce method 256 set interval update token catch login return authenticated boolean has any role roles length true some realm get undefined logout

---

*Built from the code itself: parsed symbols, the import graph, git history and
the knowledge graph. Every statement here is checked against the source rather
than written about it.*