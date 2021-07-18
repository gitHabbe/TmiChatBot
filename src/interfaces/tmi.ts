import { ChatUserstate } from "tmi.js";

export interface TmiMessageProps {
  channel: string;
  tags: ChatUserstate;
  message: string;
  self: boolean;
}

export enum CommandName {
  WR = "WR",
  PB = "PB",
  TITLE = "TITLE",
  UPTIME = "UPTIME",
  JOIN = "JOIN",
}
