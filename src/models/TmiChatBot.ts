import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { MessageData } from "./MessageData";
import { CommandList, StandardCommandList } from "./commands/StandardCommandList";
import { CustomCommand } from "./commands/CustomCommand";
import { LinkCommand } from "./commands/LinkCommand";
import { UserModel } from "./database/UserPrisma";
import { JoinedUser } from "../interfaces/prisma";
import channels from "../private/tmi_channels.json";
import { CommandName } from "../interfaces/tmi";
import { ClientSingleton } from "./database/ClientSingleton";
import { ChatEvent } from "./tmi/ChatEvent";


export class TmiChatBot {
  private chatEvent = new ChatEvent();
  private client = ClientSingleton.getInstance().get();

  constructor() {
    this.addMessageEvent()
  }

  connect(): void {
    this.client.connect().then()
  }

  private addMessageEvent(): void {
    this.client.on("message", this.chatEvent.onMessage)
  }
}

