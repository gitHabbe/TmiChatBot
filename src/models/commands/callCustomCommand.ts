import { Client } from "tmi.js";
import { isUserCustomCommand } from "../../commands/tmi";

export const callCustomCommand = async (
  tmiClient: Client,
  streamer: string,
  channel: string,
  chatterCommand: string
): Promise<boolean> => {
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
  if (isCommand) {
    tmiClient.say(channel, isCommand.content);
    return true;
  }

  return false;
};
