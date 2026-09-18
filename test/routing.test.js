import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { matchesActiveWhen, isAppActive } from '../src/routing.js';

describe('matchesActiveWhen', () => {
  test('root pattern "/" matches any path', () => {
    assert.equal(matchesActiveWhen('/', '/'), true);
    assert.equal(matchesActiveWhen('/', '/dashboard'), true);
    assert.equal(matchesActiveWhen('/', '/dashboard/42'), true);
  });

  test('exact prefix matches nested paths but not siblings', () => {
    assert.equal(matchesActiveWhen('/settings', '/settings'), true);
    assert.equal(matchesActiveWhen('/settings', '/settings/profile'), true);
    assert.equal(matchesActiveWhen('/settings', '/settings-admin'), false);
    assert.equal(matchesActiveWhen('/settings', '/dashboard'), false);
  });

  test('dynamic segments match any value in that position', () => {
    assert.equal(matchesActiveWhen('/users/:userId/profile', '/users/42/profile'), true);
    assert.equal(matchesActiveWhen('/users/:userId/profile', '/users/42'), false);
  });

  test('array of patterns is a logical OR', () => {
    const activeWhen = ['/dashboard', '/settings'];
    assert.equal(matchesActiveWhen(activeWhen, '/dashboard'), true);
    assert.equal(matchesActiveWhen(activeWhen, '/settings'), true);
    assert.equal(matchesActiveWhen(activeWhen, '/billing'), false);
  });
});

describe('isAppActive', () => {
  const authenticated = { isAuthenticated: () => true, hasAnyRole: () => true };
  const unauthenticated = { isAuthenticated: () => false, hasAnyRole: () => false };

  test('route mismatch wins regardless of auth state', () => {
    const app = { activeWhen: '/settings', public: true, requiredRoles: [] };
    assert.equal(isAppActive(app, '/dashboard', authenticated), false);
  });

  test('public app is active on route match even when unauthenticated', () => {
    const app = { activeWhen: '/', public: true, requiredRoles: [] };
    assert.equal(isAppActive(app, '/anything', unauthenticated), true);
  });

  test('non-public app requires authentication', () => {
    const app = { activeWhen: '/dashboard', public: false, requiredRoles: [] };
    assert.equal(isAppActive(app, '/dashboard', unauthenticated), false);
    assert.equal(isAppActive(app, '/dashboard', authenticated), true);
  });

  test('requiredRoles gates on role membership, not just authentication', () => {
    const app = { activeWhen: '/settings', public: false, requiredRoles: ['admin'] };
    const authedNoRole = { isAuthenticated: () => true, hasAnyRole: () => false };
    const authedWithRole = { isAuthenticated: () => true, hasAnyRole: () => true };

    assert.equal(isAppActive(app, '/settings', authedNoRole), false);
    assert.equal(isAppActive(app, '/settings', authedWithRole), true);
  });
});
