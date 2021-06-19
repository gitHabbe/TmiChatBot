import { Client, ChatUserstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";
import { searchSpeedgameByName } from "./commands/speedrun";
import { getStreamerTitle } from "./commands/twitch";

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
  const [arg1, arg2, arg3] = message.split(" ").slice(1);
  console.log(arg1, arg2, arg3);

  console.log(userCommandName);
  switch (userCommandName) {
    case CommandName.TITLE:
      const title = await getStreamerTitle(channel.slice(1));
      tmiClient.say(channel, title);
      break;
    case CommandName.WR:
      console.log(arg1);
      const game = await searchSpeedgameByName(arg1);
      console.log(game);
      break;
    case CommandName.PB:
      console.log("PB");
      break;

    default:
      break;
  }
});
