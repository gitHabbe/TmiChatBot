import { Client } from "tmi.js";
import { tweetInfo, youtubeInfo } from "../../commands/socialMedia";
import { twitterRegex } from "../../config/twitterConfig";
import { youtubeRegex } from "../../config/youtubeConfig";
import { MessageData } from "../Tmi";

export const callLinkCommand = async (
  tmiClient: Client,
  messageData: MessageData
): Promise<boolean> => {
  const { message, channel } = messageData;
  const youtube_hit = youtubeRegex.exec(message);
  const tweet_hit = twitterRegex.exec(message);

  if (youtube_hit) {
    tmiClient.say(channel, await youtubeInfo(youtube_hit));
    return true;
  } else if (tweet_hit) {
    tmiClient.say(channel, await tweetInfo(tweet_hit));
    return true;
  }

  return false;
};
