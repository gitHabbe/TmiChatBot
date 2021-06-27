export interface GameType {
  id: string;
  abbreviation: string;
  platforms: string[];
  names: Names;
  links: Links;
}

interface Names {
  international: string;
  japanese: string;
  twitch: string;
}

interface Links {
  rel: string;
  uri: string;
}

export interface SpeedrunResponse {
  data: GameType[];
}

export interface CategoryType {
  id: string;
  name: string;
  links: Links;
}

export interface CategoryResponse {
  data: CategoryType[];
}

// export interface GameAndCategoryQuery {

// }
