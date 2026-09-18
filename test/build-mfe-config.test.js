import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { validateAndNormalize, loadConfigs } from '../scripts/build-mfe-config.js';

describe('validateAndNormalize', () => {
  test('applies defaults for optional fields', () => {
    const app = validateAndNormalize(
      { name: 'dashboard', entry: 'http://x/dashboard.js', activeWhen: '/dashboard' },
      'dashboard.yaml'
    );

    assert.deepEqual(app, {
      name: 'dashboard',
      entry: 'http://x/dashboard.js',
      container: '#app',
      activeWhen: '/dashboard',
      public: false,
      requiredRoles: [],
      customProps: {},
    });
  });

  test('passes through public, requiredRoles, container, customProps', () => {
    const app = validateAndNormalize(
      {
        name: 'settings',
        entry: 'http://x/settings.js',
        activeWhen: '/settings',
        container: '#main',
        public: true,
        requiredRoles: ['admin'],
        customProps: { theme: 'dark' },
      },
      'settings.yaml'
    );

    assert.equal(app.container, '#main');
    assert.equal(app.public, true);
    assert.deepEqual(app.requiredRoles, ['admin']);
    assert.deepEqual(app.customProps, { theme: 'dark' });
  });

  test('rejects a config missing a required field', () => {
    assert.throws(
      () => validateAndNormalize({ name: 'dashboard', activeWhen: '/dashboard' }, 'dashboard.yaml'),
      /Invalid config in dashboard\.yaml/
    );
  });

  test('rejects unknown fields', () => {
    assert.throws(
      () =>
        validateAndNormalize(
          { name: 'dashboard', entry: 'http://x/d.js', activeWhen: '/dashboard', typo: true },
          'dashboard.yaml'
        ),
      /Invalid config in dashboard\.yaml/
    );
  });

  test('accepts an array activeWhen', () => {
    const app = validateAndNormalize(
      { name: 'dashboard', entry: 'http://x/d.js', activeWhen: ['/dashboard', '/home'] },
      'dashboard.yaml'
    );
    assert.deepEqual(app.activeWhen, ['/dashboard', '/home']);
  });
});

describe('loadConfigs', () => {
  let dir;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mfe-config-test-'));
  });

  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  function writeYaml(filename, contents) {
    fs.writeFileSync(path.join(dir, filename), contents);
  }

  test('merges multiple YAML files into an array, sorted by filename', () => {
    writeYaml('b-settings.yaml', 'name: settings\nentry: http://x/s.js\nactiveWhen: /settings\n');
    writeYaml('a-dashboard.yaml', 'name: dashboard\nentry: http://x/d.js\nactiveWhen: /dashboard\n');

    const apps = loadConfigs(dir);

    assert.deepEqual(
      apps.map((a) => a.name),
      ['dashboard', 'settings']
    );
  });

  test('throws on duplicate app names across files', () => {
    writeYaml('a.yaml', 'name: dashboard\nentry: http://x/a.js\nactiveWhen: /a\n');
    writeYaml('b.yaml', 'name: dashboard\nentry: http://x/b.js\nactiveWhen: /b\n');

    assert.throws(() => loadConfigs(dir), /Duplicate MFE name "dashboard"/);
  });

  test('throws when the config directory does not exist', () => {
    assert.throws(() => loadConfigs(path.join(dir, 'missing')), /MFE config directory not found/);
  });

  test('throws with the filename on malformed YAML', () => {
    writeYaml('broken.yaml', 'name: [this is not valid: yaml');

    assert.throws(() => loadConfigs(dir), /Failed to parse broken\.yaml/);
  });
});
