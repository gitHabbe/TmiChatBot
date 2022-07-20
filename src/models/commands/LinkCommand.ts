import { twitterAPI, twitterRegex } from "../../config/twitterConfig";
import { youtubeAPI, youtubeRegex } from "../../config/youtubeConfig";
import {
  ITwitterTweet,
  ITwitterTweetResponse,
  ITwitterUser,
  IYoutubePagination,
  RegexLink
} from "../../interfaces/socialMedia";
import { numberToRoundedWithLetter, youtubeDurationToHHMMSS } from "../../utility/dateFormat";
import { MessageData } from "../MessageData";

abstract class LinkPattern {
  protected constructor(public pattern: RegExp, public text: string) {}

  parse = () => {
    return this.pattern.test(this.text)
  }

  exec = () => {
    return this.pattern.exec(this.text)
  }
}


class YoutubeLink extends LinkPattern implements RegexLink {

  constructor(public pattern: RegExp, public text: string) {
    super(pattern, text);
  }

  print = async (): Promise<string> => {
    const regex_exec = this.exec();
    if (regex_exec === null) throw new Error("Not a Youtube link");
    const youtube_id = regex_exec[3];
    const query = `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
    const {data: youtube_pagination} = await youtubeAPI.get<IYoutubePagination>(query);
    const video = youtube_pagination.items[0];
    const {viewCount, likeCount } = video.statistics;
    const duration = youtubeDurationToHHMMSS(video.contentDetails.duration);
    const views = numberToRoundedWithLetter(viewCount);
    const title = video.snippet.title;
    const likes = numberToRoundedWithLetter(likeCount)
    return `${title} [${duration} - ${likes} likes - ${views}]`;
  }
}


class TwitterLink extends LinkPattern implements RegexLink {

  constructor(public pattern: RegExp, public text: string) {
    super(pattern, text);
  }

  print = async (): Promise<string> => {
    const regex_exec = this.exec();
    if (regex_exec === null) throw new Error("Not a Twitter link");
    const tweet_id = regex_exec[1];
    const query = `/tweets/${tweet_id}?expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`
    const {data: tweet} = await twitterAPI.get<ITwitterTweetResponse>(query);
    const {text}: ITwitterTweet = tweet.data;
    const {name, username, verified}: ITwitterUser = tweet.includes.users[0];
    const verifiedCheck: string = verified ? "✔" : ""; // alts: ✅ 💬

    return `[${name}@${username}${verifiedCheck}] ${text}`;
  }
}

export class LinkCommand {
  private regexLinks: RegexLink[] = [
      new YoutubeLink(youtubeRegex, this.messageData.message),
      new TwitterLink(twitterRegex, this.messageData.message)
  ]

  constructor(public messageData: MessageData) {}

  isLink = (): RegexLink | undefined => {
    return this.regexLinks.find((regexLink: RegexLink) => {
      if (regexLink.parse()) return regexLink;
    })
  }

  print = () => {
    const isLink = this.isLink()
    if (isLink === undefined) throw new Error("Not a link")
    return isLink.print()
  }
}
