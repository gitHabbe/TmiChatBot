export interface IYoutubeStatistics {
  viewCount: string;
  likeCount: string;
  dislikeCount: string;
  favoriteCount: string;
  commentCount: string;
}

export interface IYoutubeItem {
  etag: string;
  statistics: IYoutubeStatistics;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
  };
  contentDetails: {
    duration: string;
  };
}

export interface IYoutubePagination {
  kind: string;
  etag: string;
  items: IYoutubeItem[];
}

export interface ITwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

export interface ITwitterUser {
  id: string;
  username: string;
  name: string;
  verified: boolean;
}

export interface ITwitterTweetResponse {
  data: ITwitterTweet;
  includes: {
    users: ITwitterUser[];
  };
}

export interface RegexLink {
    text: string;
    pattern: RegExp;
    parse: () => boolean;
    print: () => Promise<string>;
    // print: (regex_hit: RegExpExecArray) => Promise<string>;
}