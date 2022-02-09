import { MessageData } from "../models/Tmi";

export interface ICommand {
  messageData: MessageData;
  run(): Promise<string>;
}
