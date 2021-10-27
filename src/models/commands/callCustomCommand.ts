import { Client } from "tmi.js";
import { isUserCustomCommand } from "../../commands/tmi";
import { MessageData } from "../Tmi";

export const callCustomCommand = async (
  tmiClient: Client,
  messageData: MessageData
): Promise<boolean> => {
  const { message, channel } = messageData;
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(channel, chatterCommand);
  if (isCommand) {
    tmiClient.say(channel, isCommand.content);
    return true;
  }

  return false;
};
