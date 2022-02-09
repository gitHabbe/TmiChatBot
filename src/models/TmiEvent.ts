import { OnMessage } from "../interfaces/tmi";
import { Tmi } from "./Tmi";

export class Events {
  private tmi = new Tmi();

  onMessage = (callback: OnMessage) => {
    this.tmi.on("message", callback);
  };
}
