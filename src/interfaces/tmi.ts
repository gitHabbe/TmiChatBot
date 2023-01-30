import { ChatUserstate, Client } from "tmi.js";

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
  ILWR = "ILWR",
  ILPB = "ILPB",
  TTWR = "TTWR",
  TTPB = "TTPB",
  TOGGLE = "TOGGLE",
  SETSPEEDRUNNER = "SETSPEEDRUNNER",
}

export enum ModuleFamily {
  TITLE = "TITLE",
  UPTIME = "UPTIME",
  SPEEDRUN = "SPEEDRUN",
  PROTECTED = "PROTECTED",
  FOLLOWAGE = "FOLLOWAGE",
}

export enum ComponentsSupport {
  SLOTS = "SLOTS",
  POKEMON = "POKEMON",
  PKMN = "PKMN",
}

export type OnMessage = (
  streamer: string,
  chatter: ChatUserstate,
  message: string,
  self: boolean
) => void;

export interface TmiClient {
    on(event: any, listener: any): Client;
    connect(): Promise<[ string, number ]>;
    say(channel: string, message: string): void;
}