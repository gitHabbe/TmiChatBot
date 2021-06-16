import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", (channel, userstate, message, self) => {
  if (self) return;
  const isCommand: boolean = message.startsWith("!");
  if (isCommand) return;

  const userCommandName: string = message.split(" ")[0].slice(1).toUpperCase();
  switch (userCommandName) {
    case CommandName.WR:
      console.log("WR");
      break;
    case CommandName.PB:
      console.log("PB");
      break;

    default:
      break;
  }
});
