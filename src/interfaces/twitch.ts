export interface IStreamer {
  id: string;
  display_name: string;
  broadcaster_login: string;
  game_id: string;
  game_name: string;
  islive: boolean;
  title: string;
  started_at: string;
}

export interface IStreamerResponse {
  data: IStreamer[];
}

export interface IVideo {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  url: string;
  viewable: string;
  duration: string;
}

export interface IVideosResponse {
  data: IVideo[];
}
