import { Message, Response } from "./factories/Module.factory";

// Modules
import YouTubeModule from "./modules/YouTube.module";

import { Unsubscribable } from "xstate";

export enum Service {
  Youtube = "youtube",
}

console.log("🚀 Mirage extension background");

const services = {
  [Service.Youtube]: new YouTubeModule(),
};

const messageHandler = (msg: Message) => {
  if (!msg || !msg.service || !Object.values(Service).includes(msg.service)) {
    throw new Error("Malformed message");
  }

  console.log(`📥 Message received for service "${msg.service}"`);

  services[msg.service].interpreter.send(msg.send);
};

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name == "Mirage IPC");

  console.log("✔ Connected with popup");

  let subscribers: Unsubscribable[] = [];

  port.onDisconnect.addListener(() => {
    console.log("❌ Disconnected with popup");

    subscribers.forEach((service) => service.unsubscribe());
  });

  port.onMessage.addListener(messageHandler);

  Object.entries(services).forEach(([name, service]) => {
    subscribers.push(
      service.interpreter.subscribe((state) =>
        sendResponse(port, { service: name as Service, state })
      )
    );
  });
});

const sendResponse = <S extends Service>(
  port: chrome.runtime.Port,
  payload: Response<S>
) => {
  console.log(`📤 Response sent from service "${payload.service}"`);
  port.postMessage(payload);
};
