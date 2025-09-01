import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../../bus/event.bus.js';
import type { StoreSdkEvent } from '../../sdk.events.js';

type T = StoreSdkEvent & { 't:ev': void };

describe('EventBus extra coverage', () => {
  it('middleware disposer removes middleware', () => {
    const bus = new EventBus<T>();
    const calls: string[] = [];
    const dispose = bus.use((_c, n) => {
      calls.push('mw');
      n();
    });
    bus.emit('auth:login:start');
    expect(calls).toHaveLength(1);
    dispose();
    bus.emit('auth:login:start');
    expect(calls).toHaveLength(1); // not incremented after dispose
  });

  it('onAny disposer removes handler', () => {
    const bus = new EventBus<T>();
    const any = vi.fn();
    const dispose = bus.onAny(any);
    bus.emit('auth:login:start');
    dispose();
    bus.emit('auth:login:start');
    expect(any).toHaveBeenCalledTimes(1);
  });
});
