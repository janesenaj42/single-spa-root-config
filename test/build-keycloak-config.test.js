import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildKeycloakConfig } from '../scripts/build-keycloak-config.js';

describe('buildKeycloakConfig', () => {
  test('maps env vars to the keycloak-js config shape', () => {
    const config = buildKeycloakConfig({
      KEYCLOAK_URL: 'http://localhost:8080',
      KEYCLOAK_REALM: 'my-realm',
      KEYCLOAK_CLIENT_ID: 'root-config',
    });

    assert.deepEqual(config, {
      url: 'http://localhost:8080',
      realm: 'my-realm',
      clientId: 'root-config',
    });
  });

  for (const missing of ['KEYCLOAK_URL', 'KEYCLOAK_REALM', 'KEYCLOAK_CLIENT_ID']) {
    test(`throws when ${missing} is missing`, () => {
      const env = {
        KEYCLOAK_URL: 'http://localhost:8080',
        KEYCLOAK_REALM: 'my-realm',
        KEYCLOAK_CLIENT_ID: 'root-config',
      };
      delete env[missing];

      assert.throws(() => buildKeycloakConfig(env), new RegExp(`Missing required env var ${missing}`));
    });
  }
});
