import { Client } from "tmi.js";
import { tmiOptions } from "./config/tmiConfig";
import { isUserCustomCommand } from "./commands/tmi";
import { youtubeRegex } from "./config/youtubeConfig";
import { tweetInfo, youtubeInfo } from "./commands/socialMedia";
import { twitterRegex } from "./config/twitterConfig";
import { callStandardCommand } from "./models/commands/callStandardCommand";

export const tmiClient = new Client(tmiOptions);

try {
  tmiClient.connect();
  console.log("TMI logged in!");
} catch (error) {
  console.log(`TMI Connect error: ${error}`);
}

tmiClient.on("message", async (channel, userstate, message, self) => {
  if (self) return;
  const youtube_hit = youtubeRegex.exec(message);
  const tweet_hit = twitterRegex.exec(message);

  if (youtube_hit) {
    return tmiClient.say(channel, await youtubeInfo(youtube_hit));
  } else if (tweet_hit) {
    return tmiClient.say(channel, await tweetInfo(tweet_hit));
  }

  const streamer: string = channel.slice(1);
  const chatterCommand: string = message.split(" ")[0];
  const isCommand = await isUserCustomCommand(streamer, chatterCommand);
  if (isCommand) return tmiClient.say(channel, isCommand.content);

  if (message[0] !== "!") return;
  const chatterCommandUpper: string = chatterCommand.slice(1).toUpperCase();
  const messageArray: string[] = message.split(" ").slice(1);
  console.log("chatterCommandUpper:", chatterCommandUpper);

  await callStandardCommand(
    tmiClient,
    chatterCommandUpper,
    channel,
    streamer,
    messageArray,
    userstate
  );
});
