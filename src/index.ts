import { TmiChatBot } from "./models/TmiChatBot";

try {
  const tmiChatBot = new TmiChatBot()
  tmiChatBot.connect()
} catch (error) {
  console.log("Error connecting bot...")
}
