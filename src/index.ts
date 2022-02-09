import {Tmi} from "./models/Tmi";

try {
  const tmi = new Tmi();
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}
