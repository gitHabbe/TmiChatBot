import { twitterAPI, twitterRegex } from "../../config/twitterConfig";
import { youtubeAPI, youtubeRegex } from "../../config/youtubeConfig";
import { ITwitterTweet, ITwitterTweetResponse, ITwitterUser, IYoutubePagination } from "../../interfaces/socialMedia";
import { numberToRoundedWithLetter, youtubeDurationToHHMMSS } from "../../utility/dateFormat";
import { MessageData } from "../MessageData";
import { ICommand } from "../../interfaces/Command";

export class RegexPattern {
  constructor(public pattern: RegExp, public text: string) {}

  parse = (): boolean => this.pattern.test(this.text)
  exec = (): RegExpExecArray | null => this.pattern.exec(this.text)
}

class YoutubeLink implements SocialMediaLink {

  constructor(public regexPattern: RegexPattern) {}

  print = async (): Promise<string> => {
    const regex_exec = this.regexPattern.exec();
    if (regex_exec === null) throw new Error("Not a Youtube link");
    const youtube_id = regex_exec[3];
    const query = `/videos?id=${youtube_id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics,status`
    const { data: youtube_pagination } = await youtubeAPI.get<IYoutubePagination>(query);
    const video = youtube_pagination.items[0];
    const { viewCount, likeCount } = video.statistics;
    const duration = youtubeDurationToHHMMSS(video.contentDetails.duration);
    const views = numberToRoundedWithLetter(viewCount);
    const title = video.snippet.title;
    const likes = numberToRoundedWithLetter(likeCount)
    return `${title} [${duration} - ${likes} likes - ${views}]`;
  }
}


interface SocialMediaLink {
  regexPattern: RegexPattern;

  print: () => Promise<string>;
}

class TwitterLink implements SocialMediaLink {

  constructor(public regexPattern: RegexPattern) {}

  print = async (): Promise<string> => {
    const regex_exec = this.regexPattern.exec();
    if (regex_exec === null) throw new Error("Not a Twitter link");
    const tweet_id = regex_exec[1];
    const query = `/tweets/${tweet_id}?expansions=author_id&user.fields=name,username,verified&tweet.fields=public_metrics,created_at`
    const { data: tweet } = await twitterAPI.get<ITwitterTweetResponse>(query);
    const { text }: ITwitterTweet = tweet.data;
    const { name, username, verified }: ITwitterUser = tweet.includes.users[0];
    const verifiedCheck: string = verified ? "✔" : ""; // alts: ✅ 💬

    return `[${name}@${username}${verifiedCheck}] ${text}`;
  }
}

export class LinkCommand implements ICommand {
  private socialMediaLinks: SocialMediaLink[] = []

  constructor(public messageData: MessageData) {
    this.socialMediaLinks = [
      new YoutubeLink(new RegexPattern(youtubeRegex, this.messageData.message)),
      new TwitterLink(new RegexPattern(twitterRegex, this.messageData.message))
    ]
  }

  getLink = () => {
    return this.socialMediaLinks.find((socialMediaLink) => {
      if (socialMediaLink.regexPattern.parse()) return socialMediaLink;
    })
  }

  run = async (): Promise<MessageData> => {
    const isLink = this.getLink()
    if (isLink === undefined) throw new Error("Not a link")
    this.messageData.response = await isLink.print()
    return this.messageData
  }
}
