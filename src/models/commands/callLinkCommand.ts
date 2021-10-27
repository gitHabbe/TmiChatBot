import { Client } from "tmi.js";
import { tweetInfo, youtubeInfo } from "../../commands/socialMedia";
import { twitterRegex } from "../../config/twitterConfig";
import { youtubeRegex } from "../../config/youtubeConfig";

export const callLinkCommand = async (
  tmiClient: Client,
  channel: string,
  message: string
): Promise<boolean> => {
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
