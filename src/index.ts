import { Tmi } from "./models/Tmi";

const tmi = new Tmi();

try {
  tmi.connect()
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}
