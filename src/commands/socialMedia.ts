import { twitterAPI } from "../config/twitterConfig";
import { youtubeAPI } from "../config/youtubeConfig";
import {
  ITwitterTweet,
  ITwitterTweetResponse,
  ITwitterUser,
  IYoutubePagination,
} from "../interfaces/socialMedia";
import {
  numberToRoundedWithLetter,
  youtubeDurationToHHMMSS,
} from "../utility/dateFormat";

export const youtubeInfo = async (
  youtube_hit: RegExpExecArray
): Promise<string> => {
  try {
    const youtube_id = youtube_hit[3];
    const { data: youtube_pagination } =
      await youtubeAPI.get<IYoutubePagination>(
        `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
      );
    const video = youtube_pagination.items[0];
    const { viewCount, likeCount, dislikeCount } = video.statistics;
    const likePercent = Math.round(
      (parseInt(likeCount) / (parseInt(likeCount) + parseInt(dislikeCount))) *
        100
    );
    const duration = youtubeDurationToHHMMSS(video.contentDetails.duration);
    const views = numberToRoundedWithLetter(viewCount);
    const title = video.snippet.title;
    return `${title} [${duration} - ${likePercent}% - ${views}]`;
  } catch (error) {
    if (error.message) return error.message;
    return "";
  }
};

export const tweetInfo = async (
  tweet_hit: RegExpExecArray
): Promise<string> => {
  try {
    const tweet_id = tweet_hit[1];
    const { data: tweet } = await twitterAPI.get<ITwitterTweetResponse>(
      `/tweets/${tweet_id}?expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`
    );
    console.log("tweet:", tweet);
    const { text }: ITwitterTweet = tweet.data;
    const { name, username, verified }: ITwitterUser = tweet.includes.users[0];
    const verifiedCheck: string = verified ? "✔" : ""; // alt: ✅

    return `[${name}@${username}${verifiedCheck}] ${text}`;
  } catch (error) {
    if (error.message) return error.message;
    return "";
  }
};
