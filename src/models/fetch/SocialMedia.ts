import { youtubeAPI, youtubeRegex } from "../../config/youtubeConfig";
import { twitterAPI, twitterRegex } from "../../config/twitterConfig";
import { ITwitterTweet, ITwitterTweetResponse, ITwitterUser, IYoutubePagination, } from "../../interfaces/socialMedia";
import {
  numberToRoundedWithLetter,
  youtubeDurationToHHMMSS,
} from "../../utility/dateFormat";

interface Link {
  regex: RegExpExecArray;
  getMessage(): Promise<string>;
}

export class LinkParser {
  constructor(private message: string) {}

  async getLinkMessage(): Promise<string> {
    const youtubeRegexResult = youtubeRegex.exec(this.message)
    if (youtubeRegexResult) {
      const youtubeLink = new YoutubeLink(youtubeRegexResult);
      return await youtubeLink.getMessage();
    }
    const twitterRegexResults = twitterRegex.exec(this.message);
    if (twitterRegexResults) {
      const twitterLink = new TwitterLink(twitterRegexResults);
      return await twitterLink.getMessage();
    }
    return "";
  };
}

export class TwitterLink implements Link {
  constructor(public regex: RegExpExecArray) {}

  async getMessage(): Promise<string> {
    const tweet_id = this.regex[1];
    const tweetFieldsQuery = `expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`;
    const query = `/tweets/${tweet_id}?${tweetFieldsQuery}`
    const tweet = await this.fetchTweet(query);
    const { text }: ITwitterTweet = tweet.data;
    const { name, username, verified }: ITwitterUser =
      tweet.includes.users[0];
    const verifiedCheck: string = verified ? "✔" : ""; // alts: ✅ 💬

    return `[${name}@${username}${verifiedCheck}] ${text}`;
  };

  async fetchTweet(query: string) {
    try {
      const { data } = await twitterAPI.get<ITwitterTweetResponse>(query)
      return data;
    } catch {
      throw new Error("Error getting tweet info")
    }
  };
}

export class YoutubeLink implements Link {
  constructor(public regex: RegExpExecArray) {}

  async getMessage(): Promise<string> {
    const youtube_id = this.regex[3];
    const query = `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
    const videos = await this.fetchVideos(query);
    const video = videos.items[0];
    const { viewCount, likeCount } = video.statistics;
    const videoDuration = youtubeDurationToHHMMSS(video.contentDetails.duration);
    const views = numberToRoundedWithLetter(viewCount);
    const title = video.snippet.title;
    const videoLikeCount = numberToRoundedWithLetter(likeCount)

    return `${title} [${videoDuration} - ${videoLikeCount}👍 - ${views}]`;
  };

  async fetchVideos(query: string): Promise<IYoutubePagination> {
    try {
      const { data } = await youtubeAPI.get<IYoutubePagination>(query);
      return data;
    } catch {
      throw new Error("Error getting youtube video info")
    }
  }
}
