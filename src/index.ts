import { Client, Userstate } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { CommandName } from "./interfaces/tmi";
import { searchSpeedgameByName } from "./commands/speedrun";
import { getStreamerTitle, getStreamerUptime } from "./commands/twitch";
import { createUser } from "./commands/tmi";

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

  const streamer: string = channel.slice(1);
  const userCommandName: string = message.split(" ")[0].slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);

  switch (userCommandName) {
    case CommandName.UPTIME:
      const uptime = await getStreamerUptime(streamer);
      tmiClient.say(channel, uptime);
      break;
    case CommandName.TITLE:
      const title = await getStreamerTitle(streamer);
      tmiClient.say(channel, title);
      break;
    case CommandName.WR:
      const time = await searchSpeedgameByName(streamer, messageArray);
      tmiClient.say(channel, time);
      break;
    case CommandName.PB:
      console.log("PB");
      break;
    case CommandName.JOIN:
      const message = await createUser(channel, userstate.username);
      tmiClient.say(channel, message);
      break;

    default:
      break;
  }
});
