import { PokemonItem, PokemonMove } from "../../src/interfaces/pokemon"

export const pokemonItemMock: PokemonItem = {
    id: 4,
    cost: 200,
    effect_entries: [
        {
            effect: "Used in battle :   Attempts to catch a wild Pokémon, using a catch rate of 1×. If used in a trainer battle, nothing happens and the ball is lost.",
            short_effect: "Tries to catch a wild Pokémon.",
        }
    ],
    fling_power: null,
    names: [
        {
            language: {
                name: "en",
                url: "https://pokeapi.co/api/v2/language/9/"
            },
            name: "Poké Ball"
        }
    ]
}
export const pokemonMoveMock: PokemonMove = {
    effect_entries: [
      {
          effect: "Inflicts regular damage.  Has a $effect_chance% chance to burn the target.",
          short_effect: "Has a $effect_chance% chance to burn the target."
      }
    ],
    flavor_text_entries: [
      {
          flavor_text: "An attack that may\ninflict a burn.",
          language: {
              name: "en"
          }
      }
    ],
    id: 52,
    name: "ember",
    names: [
        {
            language: {
                name: "en"
            },
            name: "Ember"
        }
    ],
    damage_class: { name: "special" },
    meta: {
        crit_rate: 0,
        flinch_chance: 0,
        ailment:
            {
                name: "burn"
            },
        ailment_chance: 10
    },
    power: 40,
    pp: 25,
    priority: 0,
    type: { name: "fire" },
    accuracy: 100
}