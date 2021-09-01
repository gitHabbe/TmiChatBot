export interface IPokemon {
  id: string;
  name: string;
  stats: {
    base_stat: string;
    effort: number;
    stat: {
      name: string;
    };
  }[];
  types: {
    type: {
      name: string;
    };
  }[];
}
