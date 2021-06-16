import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on(
  "message",
  (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    if (self) return;

    const firstWord = message.startsWith("!");
  }
);
