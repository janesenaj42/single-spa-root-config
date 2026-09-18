import Keycloak from 'keycloak-js';

let keycloak;

export async function initAuth() {
  const res = await fetch('/keycloak.json', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load /keycloak.json: ${res.status} ${res.statusText}`);
  }
  const config = await res.json();

  keycloak = new Keycloak(config);

  await keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
    pkceMethod: 'S256',
  });

  setInterval(() => {
    keycloak.updateToken(30).catch(() => keycloak.login());
  }, 20000);

  return keycloak;
}

export function isAuthenticated() {
  return Boolean(keycloak && keycloak.authenticated);
}

export function hasAnyRole(roles) {
  if (!roles || roles.length === 0) return true;
  return roles.some((role) => keycloak.hasRealmRole(role));
}

export function getToken() {
  return keycloak ? keycloak.token : undefined;
}

export function login() {
  return keycloak.login();
}

export function logout() {
  return keycloak.logout({ redirectUri: window.location.origin });
}
