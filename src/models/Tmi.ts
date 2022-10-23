import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";
import { MessageData } from "./MessageData";
import { StandardCommand } from "./commands/StandardCommand";
import { CustomCommand } from "./commands/CustomCommand";
import { LinkCommand } from "./commands/LinkCommand";

export class Tmi {
  client: Client;

  constructor(client: Client = new Client(tmiOptions)) {
    this.client = client;
    this.addMessageEvent()
  }

  connect = () => {
    this.client.connect().then();
  }

  addMessageEvent = (): void => {
    this.client.on("message", this.onMessage)
  }

  private onMessage: OnMessage = async (streamer: string, chatter: ChatUserstate, message: string, self: boolean) => {
    if (self) return //"Bot self message";
    try {
      let messageData: MessageData = new MessageData(streamer, chatter, message);

      const standardCommand = new StandardCommand(messageData, this.client);
      messageData = await standardCommand.run();
      console.log(messageData)
      if (messageData.response.length > 0) {
        return await this.client.say(messageData.targetChannel, messageData.response)
      }
      //
      // const customCommand = new CustomCommand(messageData);
      // messageData = await customCommand.run();
      // if (messageData.response.length > 0) {
      //   return await this.client.say(messageData.targetChannel, messageData.response)
      // }
      //
      // const linkCommand = new LinkCommand(messageData);
      // messageData = await linkCommand.run()
      // if (messageData.response.length > 0) {
      //   return await this.client.say(messageData.targetChannel, messageData.response)
      // }
      //
      // return messageData
    } catch (error) {
      console.log(error)
      console.log("No command was used")
    }
  }
}

