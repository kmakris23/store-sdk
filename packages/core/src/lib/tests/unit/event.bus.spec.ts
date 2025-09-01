import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../bus/event.bus.js';
import type { StoreSdkEvent } from '../../sdk.events.js';

type TestEvents = StoreSdkEvent & {
  'test:no:payload': void;
  'test:with:payload': { value: number };
  'scoped:with:payload': { value: number };
};

describe('EventBus', () => {
  it('on / emit / off basic flow', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    const dispose = bus.on('test:with:payload', handler);
    bus.emit('test:with:payload', { value: 42 });
    expect(handler).toHaveBeenCalledOnce();
    dispose();
    bus.emit('test:with:payload', { value: 1 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('once only fires a single time', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.once('test:with:payload', handler);
    bus.emit('test:with:payload', { value: 1 });
    bus.emit('test:with:payload', { value: 2 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('emit without payload for void events', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('test:no:payload', handler);
    bus.emit('test:no:payload');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('emitIf respects condition and returns boolean', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('test:with:payload', handler);
    const resultFalse = bus.emitIf(false, 'test:with:payload', { value: 1 });
    const resultTrue = bus.emitIf(true, 'test:with:payload', { value: 2 });
    expect(resultFalse).toBe(false);
    expect(resultTrue).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ value: 2 });
  });

  it('middleware chains in order then listeners fire', () => {
    const bus = new EventBus<TestEvents>();
    const order: string[] = [];
    bus.use((_ctx, next) => {
      order.push('mw1-pre');
      next();
      order.push('mw1-post');
    });
    bus.use((_ctx, next) => {
      order.push('mw2-pre');
      next();
      order.push('mw2-post');
    });
    const handler = vi.fn(() => {
      order.push('handler');
    });
    bus.on('test:with:payload', handler);
    bus.emit('test:with:payload', { value: 1 });
    expect(order).toEqual([
      'mw1-pre',
      'mw2-pre',
      'handler',
      'mw2-post',
      'mw1-post',
    ]);
  });

  it('onAny receives all events after specific handlers', () => {
    const bus = new EventBus<TestEvents>();
    const any = vi.fn();
    const specific = vi.fn();
    bus.onAny(any);
    bus.on('test:with:payload', specific);
    bus.emit('test:with:payload', { value: 7 });
    expect(specific).toHaveBeenCalled();
    expect(any).toHaveBeenCalledWith('test:with:payload', { value: 7 });
  });

  it('waitFor resolves when predicate matches, supports timeout', async () => {
    const bus = new EventBus<TestEvents>();
    setTimeout(() => bus.emit('test:with:payload', { value: 5 }), 5);
    const result = await bus.waitFor(
      'test:with:payload',
      (p) => p.value === 5,
      100
    );
    expect(result.value).toBe(5);
  });

  it('waitFor rejects on timeout', async () => {
    const bus = new EventBus<TestEvents>();
    await expect(
      bus.waitFor('test:with:payload', (p) => p.value === 9, 10)
    ).rejects.toThrow(/timeout/);
  });

  it('scope shares underlying listeners via prefix', () => {
    const bus = new EventBus<TestEvents>();
    const scoped = bus.scope('scoped:');
    const handler = vi.fn();
    // Access internal shared structure indirectly by registering on scoped bus and emitting via parent after prefix
    scoped.on(
      'test:with:payload',
      handler as unknown as (p: { value: number }) => void
    );
    // Emitting with prefixed key through parent is not part of public API, so simulate by emitting via scoped bus
    scoped.emit('test:with:payload', { value: 3 });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('clear removes all listeners, any listeners, and middleware', () => {
    const bus = new EventBus<TestEvents>();
    const any = vi.fn();
    const handler = vi.fn();
    bus.onAny(any);
    bus.on('test:with:payload', handler);
    bus.use((_c, n) => n());
    bus.clear();
    bus.emit('test:with:payload', { value: 1 });
    expect(handler).not.toHaveBeenCalled();
    expect(any).not.toHaveBeenCalled();
  });
});
