import { youtubeAPI, youtubeRegex } from "../../config/youtubeConfig";
import { twitterAPI, twitterRegex } from "../../config/twitterConfig";
import { ITwitterTweet, ITwitterTweetResponse, ITwitterUser, IYoutubePagination, } from "../../interfaces/socialMedia";
import {
  numberToRoundedWithLetter,
  stringToProbabilityPercent,
  youtubeDurationToHHMMSS,
} from "../../utility/dateFormat";

interface Link {
  regex: RegExpExecArray;
  getMessage(): Promise<string>;
}

export class LinkParser {
  constructor(private message: string) {}

  async matchRegex(): Promise<string | null> {
    let regex = youtubeRegex.exec(this.message);
    if (regex) {
      const youtubeLink = new YoutubeLink(regex);
      return await youtubeLink.getMessage();
    }
    regex = twitterRegex.exec(this.message);
    if (regex) {
      const twitterLink = new TwitterLink(regex);
      return await twitterLink.getMessage();
    }
    return null;
  };
}

export class TwitterLink implements Link {
  constructor(public regex: RegExpExecArray) {}
  async getMessage(): Promise<string> {
    try {
      const tweet = await this.fetchTweet();
      const { text }: ITwitterTweet = tweet.data;
      const { name, username, verified }: ITwitterUser =
        tweet.includes.users[0];
      const verifiedCheck: string = verified ? "✔" : ""; // alts: ✅ 💬

      return `[${name}@${username}${verifiedCheck}] ${text}`;
    } catch (error: any) {
      if (error.message) return error.message;
      return "";
    }
  };

  async fetchTweet() {
    const tweet_id = this.regex[1];
    const tweetFieldsQuery = `expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`;
    const query = `/tweets/${tweet_id}?${tweetFieldsQuery}`;
    const { data } = await twitterAPI.get<ITwitterTweetResponse>(query);
    return data;
  };
}

export class YoutubeLink implements Link {
  constructor(public regex: RegExpExecArray) {}

  async getMessage(): Promise<string> {
    try {
      const videos = await this.fetchVideos();
      const video = videos.items[0];
      const { viewCount, likeCount, dislikeCount } = video.statistics;
      const likePercent = stringToProbabilityPercent(likeCount, dislikeCount);
      const duration = youtubeDurationToHHMMSS(video.contentDetails.duration);
      const views = numberToRoundedWithLetter(viewCount);
      const title = video.snippet.title;

      return `${title} [${duration} - ${likePercent}% - ${views}]`;
    } catch (error: any) {
      if (error) return error.message;
      return "";
    }
  };

  async fetchVideos(): Promise<IYoutubePagination> {
    const youtube_id = this.regex[3];
    const query = `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`;
    const { data } = await youtubeAPI.get<IYoutubePagination>(query);
    return data;
  }
}
