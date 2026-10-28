import type { RealtimeChannel } from '@supabase/supabase-js';

export type BindChannel = (channel: RealtimeChannel, ping: () => void) => RealtimeChannel;

type Hub = {
  listeners: Set<() => void>;
  channel: RealtimeChannel | null;
  timer: ReturnType<typeof setTimeout> | null;
  gen: number;
};

type HubStore = Map<string, Hub>;

function notify(hub: Hub) {
  for (const listener of [...hub.listeners]) {
    try {
      listener();
    } catch {
      // Un listener no puede tumbar el canal.
    }
  }
}

function uniqueTopic(gen: number) {
  return `rt-${gen}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createChannelHub(getClient: () => {
  channel: (name: string) => RealtimeChannel;
  removeChannel: (channel: RealtimeChannel) => unknown;
}) {
  const hubs: HubStore = new Map();

  function attach(key: string, hub: Hub, bind: BindChannel) {
    if (hub.channel) return;
    try {
      const client = getClient();
      hub.gen += 1;
      const ping = () => {
        if (hub.timer) return;
        hub.timer = setTimeout(() => {
          hub.timer = null;
          notify(hub);
        }, 400);
      };
      const raw = client.channel(uniqueTopic(hub.gen));
      try {
        const bound = bind(raw, ping);
        hub.channel = bound;
        bound.subscribe();
      } catch {
        try {
          client.removeChannel(raw);
        } catch {
          // ignore
        }
        hub.channel = null;
      }
    } catch {
      hub.channel = null;
    }
  }

  function detach(key: string, hub: Hub) {
    if (hub.timer) {
      clearTimeout(hub.timer);
      hub.timer = null;
    }
    const channel = hub.channel;
    hub.channel = null;
    hubs.delete(key);
    if (!channel) return;
    try {
      getClient().removeChannel(channel);
    } catch {
      // El canal ya no está. El foco alcanza.
    }
  }

  function subscribe(key: string, bind: BindChannel, onChange: () => void): () => void {
    let hub = hubs.get(key);
    if (!hub) {
      hub = { listeners: new Set(), channel: null, timer: null, gen: 0 };
      hubs.set(key, hub);
    }
    hub.listeners.add(onChange);
    attach(key, hub, bind);
    return () => {
      hub!.listeners.delete(onChange);
      if (hub!.listeners.size === 0) detach(key, hub!);
    };
  }

  return { subscribe, hubs };
}
