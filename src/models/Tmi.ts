import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";
import { LinkCommand } from "./commands/LinkCommand";
import { CustomCommand } from "./commands/CustomCommand";
import { StandardCommand } from "./commands/StandardCommand";
import { MessageData } from "./MessageData";

export class Tmi {
  private client: Client = new Client(tmiOptions);

  connect = () => {
    this.client.connect().then(r => { console.log(r)} )
    this.client.on("message", this.onMessage)
  }

  onMessage: OnMessage = async (
      streamer: string,
      chatter: ChatUserstate,
      message: string,
      self: boolean
  ) => {
    if (self) return;
    const messageData = new MessageData(streamer, chatter, message);

    try {
      const chatLink = new LinkCommand(messageData);
      const linkInfo = await chatLink.print()
      await this.client.say(streamer, linkInfo)
    } catch (error) {
      return
    }
    try {
      const customCommand = new CustomCommand(messageData)
      const command = await customCommand.run();
      await this.client.say(streamer, command)
    } catch (error) {
      return
    }

    if (message[0] !== "!") return;

    try {
      const standardCommand = new StandardCommand(messageData, this.client);
      const command = await standardCommand.run();
      await this.client.say(streamer, command);
    } catch (error) {
      return this.client.say(streamer, error.message)
    }
  }
}

