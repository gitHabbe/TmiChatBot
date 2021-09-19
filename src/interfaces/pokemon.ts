export interface IPokemon {
  id: string;
  name: string;
  stats: IPokemonStat[];
  types: {
    type: {
      name: string;
    };
  }[];
}

export interface IPokemonStat {
  base_stat: string;
  effort: number;
  stat: {
    name: string;
  };
}

export interface IPokemonStat {
  types: {
    type: {
      name: string;
    };
  }[];
}
