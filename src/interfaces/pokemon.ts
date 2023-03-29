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

export interface PokemonMove {
    id: number
    name: string
    names: [
        {
            language: {
                name: string
            },
            name: string
        }
    ]
    accuracy: number
    damage_class: {
        name: string
    }
    power: number
    pp: number
    type: {
        name: string
    }
    meta: {
        crit_rate: number
        flinch_chance: number
        ailment: {
            name: string
        }
        ailment_chance: number
    }
    priority: number
}

export interface PokemonItem {
    id: number;
    cost: number;
    effect_entries: {
        effect: string
        short_effect: string
    }
    fling_power: number | null;
    names: [
        {
            language: {
                name: string;
                url: string;
            }
            name: string;
        }
    ]

}