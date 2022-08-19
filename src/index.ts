import { Tmi } from "./models/Tmi";
import { Events } from "./models/Events";

const tmi: Tmi = new Tmi();
const events = new Events(tmi.client);

tmi.addEvent("message", events.onMessage)
try {
  tmi.connect()
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}
