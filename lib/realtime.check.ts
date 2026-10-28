import { createChannelHub, type BindChannel } from './realtimeHub';
import type { RealtimeChannel } from '@supabase/supabase-js';

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

type FakeState = { subscribed: boolean; ons: number };

function makeClient() {
  const byName = new Map<string, FakeState>();
  const channels: { name: string; state: FakeState }[] = [];

  return {
    byName,
    channels,
    channel(name: string) {
      let state = byName.get(name);
      if (!state) {
        state = { subscribed: false, ons: 0 };
        byName.set(name, state);
      }
      const ref = { name, state };
      channels.push(ref);
      const ch = {
        on() {
          if (state!.subscribed) {
            throw new Error(`cannot add postgres_changes callbacks for realtime:${name} after subscribe().`);
          }
          state!.ons += 1;
          return ch;
        },
        subscribe() {
          state!.subscribed = true;
          return ch;
        },
      };
      return ch as unknown as RealtimeChannel;
    },
    removeChannel() {
      return Promise.resolve('ok');
    },
  };
}

const bind: BindChannel = (channel, ping) => {
  ping;
  return channel.on('postgres_changes', { event: '*', schema: 'public', table: 'group_prayers' }, () => undefined);
};

{
  const client = makeClient();
  const hub = createChannelHub(() => client);
  const seen: string[] = [];
  const a = hub.subscribe('group:1', bind, () => seen.push('a'));
  const b = hub.subscribe('group:1', bind, () => seen.push('b'));
  const c = hub.subscribe('group:1', bind, () => seen.push('c'));
  assert(hub.hubs.size === 1, 'un hub por grupo');
  assert(client.byName.size === 1, 'un topic aunque haya tres pantallas');
  a();
  assert(hub.hubs.size === 1, 'el canal sigue si queda un oyente');
  b();
  c();
  assert(hub.hubs.size === 0, 'se suelta al último');
}

{
  const client = makeClient();
  const hub = createChannelHub(() => client);
  const first = hub.subscribe('group:1', bind, () => undefined);
  first();
  hub.subscribe('group:1', bind, () => undefined);
  assert(client.byName.size === 2, 'topic nuevo al reentrar, no se reusa el suscrito');
}

{
  const client = makeClient();
  const same = client.channel('group-fixed') as unknown as {
    on: () => unknown;
    subscribe: () => unknown;
  };
  same.on();
  same.subscribe();
  let threw = false;
  try {
    same.on();
  } catch (error) {
    threw = error instanceof Error && error.message.includes('after subscribe()');
  }
  assert(threw, 'el cliente falso reproduce el crash original');
}

console.log('realtime hub ok');
