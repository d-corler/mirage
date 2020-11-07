import { writable } from "svelte/store";

import type { Message } from "@mirage/background/src/factories/Module.factory";

const port = chrome.runtime.connect({
  name: "Mirage IPC",
});

/*port.postMessage({
  service: "youtube",
  send: { type: "ENABLE_FEATURE", feature: "feature_1" },
});*/

port.onMessage.addListener((msg: Message) => {
  switch (msg.service) {
  }
});

function createModule() {
  const { subscribe, set, update } = writable({
    feature_1: true,
  });

  return {
    subscribe,
    enable: () => update((n) => ({ ...n, feature_1: true })),
    disable: () => update((n) => ({ ...n, feature_1: false })),
    toggle: () => update((n) => ({ ...n, feature_1: !n.feature_1 })),
    reset: () => {},
  };
}

export const module = createModule();
