import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";
import { searchGameByName } from "./commands/speedrun";

const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const isCommand: boolean = message.startsWith("!");
  if (!isCommand) return;

  const userCommandName: string = message.split(" ")[0].slice(1).toUpperCase();
  console.log(userCommandName);
  switch (userCommandName) {
    case CommandName.WR:
      const game = await searchGameByName("sm64");
      console.log(game);
      break;
    case CommandName.PB:
      console.log("PB");
      break;

    default:
      break;
  }
});
