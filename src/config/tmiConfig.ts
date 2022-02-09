import * as dotenv from "dotenv";
import { Options } from "tmi.js";
import channels from "../private/tmi_channels.json";

dotenv.config();

export const tmiOptions: Options = {
  options: {
    clientId: process.env.TWITCH_CLIENT_ID2,
    debug: true,
  },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: "oauth:" + process.env.TWITCH_OAUTH_PASSWORD2,
  },
  channels,
};
