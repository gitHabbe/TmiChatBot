import { Tmi } from "./models/Tmi";

try {
  const tmi = new Tmi();
  tmi.connect()
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}
