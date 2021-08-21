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
  PART = "PART",
  NEWCMD = "NEWCMD",
  DELCMD = "DELCMD",
  TRUST = "TRUST",
  UNTRUST = "UNTRUST",
  TS = "TS",
  FINDTS = "FINDTS",
  DTS = "DTS",
  FOLLOWAGE = "FOLLOWAGE",
}
