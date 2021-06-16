import * as dotenv from "dotenv";
import { Options } from "tmi.js";

dotenv.config();

export const tmiOptions: Options = {
  options: {
    clientId: process.env.TWITCH_CLIENT_ID,
  },
};
