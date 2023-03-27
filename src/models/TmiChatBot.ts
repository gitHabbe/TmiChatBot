import { ChatEvent } from "./tmi/ChatEvent";
import { ClientSingleton } from "./tmi/ClientSingleton";
import { TmiClient } from "../interfaces/tmi"

export class TmiChatBot {
  private chatEvent = new ChatEvent();
  private client: TmiClient = ClientSingleton.getInstance().get();

  constructor() {
      this.client.on("message", this.chatEvent.onMessage)
      this.client.on("join", this.chatEvent.onJoin)
  }

  connect(): void {
    this.client.connect().then()
  }
}
