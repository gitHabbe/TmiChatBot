export interface IChannelType {
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
  data: IChannelType[];
}
