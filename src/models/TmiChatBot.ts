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


export class MessageParser {
    constructor(private message: string) {}

    getCommandName(): string {
        const chatterCommand: string = this.message.split(" ")[0];
        return chatterCommand.slice(1).toUpperCase();
    };
}

class ChatEvent {
  onMessage(streamer: string, chatter: ChatUserstate, message: string, self: boolean): void {
      if (self) return // Bot self message;
      const messageData: MessageData = new MessageData(streamer, chatter, message);
      const messageParser = new MessageParser(message);
      const commandName = messageParser.getCommandName();
      const isStandardCommand: boolean = commandName in CommandName
      let commandList: CommandList;
      if (isStandardCommand) {
        commandList = new StandardCommandList(messageData);
        commandList.get(commandName)
      }
      // messageData = await standardCommand.run(commandName);
    //   // console.log(messageData)
    //   // if (messageData.response.length > 0) {
    //   //   return await this.client.say(messageData.targetChannel, messageData.response)
    //   // }
    //   //
    //   // const customCommand = new CustomCommand(messageData);
    //   // messageData = await customCommand.run();
    //   // if (messageData.response.length > 0) {
    //   //   return await this.client.say(messageData.targetChannel, messageData.response)
    //   // }
    //   //
    //   // const linkCommand = new LinkCommand(messageData);
    //   // messageData = await linkCommand.run()
    //   // if (messageData.response.length > 0) {
    //   //   return await this.client.say(messageData.targetChannel, messageData.response)
    //   // }
    //   //
    //   // return messageData

  }
}

export class ClientSingleton {
    private static instance: ClientSingleton;
    public client = new Client(tmiOptions)

    static getInstance(): ClientSingleton {
        if (!ClientSingleton.instance) {
            ClientSingleton.instance = new ClientSingleton();
        }
        return ClientSingleton.instance
    }

    get(): Client {
        return this.client
    }
}

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

