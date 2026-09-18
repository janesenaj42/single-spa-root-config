import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createEventBus } from '../src/eventBus.js';

describe('createEventBus', () => {
  test('subscribe receives what publish sends on the same topic', () => {
    const bus = createEventBus(new EventTarget());
    let received;
    bus.subscribe('topic', (detail) => {
      received = detail;
    });

    bus.publish('topic', { open: true });

    assert.deepEqual(received, { open: true });
  });

  test('unrelated topics do not cross-fire', () => {
    const bus = createEventBus(new EventTarget());
    let calls = 0;
    bus.subscribe('a', () => {
      calls += 1;
    });

    bus.publish('b', {});

    assert.equal(calls, 0);
  });

  test('the returned unsubscribe function stops further delivery', () => {
    const bus = createEventBus(new EventTarget());
    let calls = 0;
    const unsubscribe = bus.subscribe('topic', () => {
      calls += 1;
    });

    bus.publish('topic', {});
    unsubscribe();
    bus.publish('topic', {});

    assert.equal(calls, 1);
  });
});
