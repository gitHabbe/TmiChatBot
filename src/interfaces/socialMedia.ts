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
