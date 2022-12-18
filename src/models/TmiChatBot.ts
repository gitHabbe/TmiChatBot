import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";
import { MessageData } from "./MessageData";
import { StandardCommandList } from "./commands/StandardCommandList";
import { CustomCommand } from "./commands/CustomCommand";
import { LinkCommand } from "./commands/LinkCommand";
import { UserModel } from "./database/UserPrisma";
import { JoinedUser } from "../interfaces/prisma";
import channels from "../private/tmi_channels.json";

export class TmiChatBot {
  constructor(public client: Client = new Client(tmiOptions)) {
    this.addMessageEvent()
  }

  connect(): void {
    this.client.connect().then()
  }

  private addMessageEvent(): void {
    this.client.on("message", this.onMessage)
  }

  private async onMessage(streamer: string, chatter: ChatUserstate, message: string, self: boolean): Promise<void> {
    if (self) return // Bot self message;
    let messageData: MessageData = new MessageData(streamer, chatter, message);

    const standardCommand = new StandardCommand(messageData, this.client);
    messageData = await standardCommand.run();
    // console.log(messageData)
    // if (messageData.response.length > 0) {
    //   return await this.client.say(messageData.targetChannel, messageData.response)
    // }
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
  }
}

