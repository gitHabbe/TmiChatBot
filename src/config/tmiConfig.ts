import * as dotenv from "dotenv";
import { Options } from "tmi.js";

dotenv.config();

export const tmiOptions: Options = {
  options: {
    clientId: process.env.TWITCH_CLIENT_ID,
    debug: true,
  },
  connection: {
    reconnect: true,
    secure: true,
  },
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: "oauth:" + process.env.TWITCH_OAUTH_PASSWORD,
  },
  channels: ["habbe"],
};
