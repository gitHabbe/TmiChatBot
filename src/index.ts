import { Client } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";

const tmiClient = new Client(tmiOptions);

tmiClient.connect();
