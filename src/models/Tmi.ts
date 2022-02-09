import { ChatUserstate, Client } from "tmi.js";
import { tmiOptions } from "../config/tmiConfig";
import { OnMessage } from "../interfaces/tmi";
import { ChatLink } from "./commands/callLinkCommand";
import { CustomCommand } from "./commands/callCustomCommand";
import { StandardCommand } from "./commands/callStandardCommand";
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
      const chatLink = new ChatLink(messageData);
      const linkInfo = await chatLink.print()
      await this.client.say(streamer, linkInfo)
      return
    } catch (error) {
      console.log("Not a link")
    }
    try {
      const customCommand = new CustomCommand(messageData)
      const command = await customCommand.run();
      await this.client.say(streamer, command)
      return
    } catch (error) {
      console.log("Not a custom command")
    }

    if (message[0] !== "!") return;

    try {
      const standardCommand = new StandardCommand(messageData, this.client);
      const command = await standardCommand.run();
      await this.client.say(streamer, command);
      return
    } catch (error) {
      console.log("Not standard command")
    }
  }
}

