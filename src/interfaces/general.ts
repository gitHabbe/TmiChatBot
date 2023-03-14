export interface GameNames {
    international: string;
    twitch: string;
}

export interface Game extends Id {
    abbreviation: string;
}

interface Id {
    id: string;
}

export interface Player extends Id, Name {}

interface Name {
    name: string;
}

export interface Category extends Id, Name {
    links: Link[]
}

export interface Link {
    rel: string;
    uri: string;
}

export interface SpeedrunGame extends Game, GameNames {
    links: Link[],
    platforms: string[]
}

export interface SpeedrunGameResponse extends Game {
    names: GameNames;
    links: Link[];
    platforms: string[];
}

export interface SpeedrunResponse<T> {
    data: T
}

export interface FullSpeedrunGame extends SpeedrunGame {
    categories: Category[]
}
