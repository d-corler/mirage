import { writable } from "svelte/store";

import { Service } from "@mirage/background";

import type {
  Message,
  Response,
} from "@mirage/background/lib/packages/background/src/factories/Module.factory";

const port = chrome.runtime.connect({
  name: "Mirage IPC",
});

// TODO : improve typing
port.onMessage.addListener((msg: Response<Service.Youtube>) => {
  switch (msg.service) {
    case Service.Youtube:
      module.set(msg.state.context.feature_1, true);
      break;
  }
});

function createModule() {
  const { subscribe, set, update } = writable({
    feature_1: true,
  });

  return {
    subscribe,
    set: (value: boolean, fromIpc: boolean) => {
      if (fromIpc) {
        return update((n) => ({ ...n, feature_1: value }));
      } else {
        return port.postMessage({
          service: "youtube",
          send: { type: "SET_FEATURE", feature: "feature_1" },
        });
      }
    },
    enable: () =>
      port.postMessage({
        service: "youtube",
        send: { type: "ENABLE_FEATURE", feature: "feature_1" },
      }),
    disable: () =>
      port.postMessage({
        service: "youtube",
        send: { type: "DISABLE_FEATURE", feature: "feature_1" },
      }),
    toggle: () =>
      port.postMessage({
        service: "youtube",
        send: { type: "TOGGLE_FEATURE", feature: "feature_1" },
      }),
  };
}

export const module = createModule();
