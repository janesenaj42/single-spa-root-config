import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseSimpleSelector } from '../src/containers.js';

describe('parseSimpleSelector', () => {
  test('parses an id selector', () => {
    assert.deepEqual(parseSimpleSelector('#admin-panel'), { type: 'id', name: 'admin-panel' });
  });

  test('parses a class selector', () => {
    assert.deepEqual(parseSimpleSelector('.widget'), { type: 'class', name: 'widget' });
  });

  test('rejects compound selectors', () => {
    assert.throws(() => parseSimpleSelector('#main .inner'), /only support simple/);
  });

  test('rejects selectors with no leading # or .', () => {
    assert.throws(() => parseSimpleSelector('main'), /only support simple/);
  });
});
