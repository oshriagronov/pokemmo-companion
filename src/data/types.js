export const TYPE_COLORS = {
  normal: 'bg-[#A8A77A]',
  fire: 'bg-[#EE8130]',
  water: 'bg-[#6390F0]',
  electric: 'bg-[#F7D02C]',
  grass: 'bg-[#7AC74C]',
  ice: 'bg-[#96D9D6]',
  fighting: 'bg-[#C22E28]',
  poison: 'bg-[#A33EA1]',
  ground: 'bg-[#E2BF65]',
  flying: 'bg-[#A98FF3]',
  psychic: 'bg-[#F95587]',
  bug: 'bg-[#A6B91A]',
  rock: 'bg-[#B6A136]',
  ghost: 'bg-[#735797]',
  dragon: 'bg-[#6F35FC]',
  dark: 'bg-[#705746]',
  steel: 'bg-[#B7B7CE]',
  fairy: 'bg-[#D685AD]',
};

// Simplified matrix: keys are the defending type, values are arrays of types that deal x2, x0.5, or x0 damage to it.
export const TYPE_MATCHUPS = {
  normal: { weaknesses: ['fighting'], resistances: [], immunities: ['ghost'] },
  fire: { weaknesses: ['water', 'ground', 'rock'], resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunities: [] },
  water: { weaknesses: ['electric', 'grass'], resistances: ['fire', 'water', 'ice', 'steel'], immunities: [] },
  electric: { weaknesses: ['ground'], resistances: ['electric', 'flying', 'steel'], immunities: [] },
  grass: { weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'], resistances: ['water', 'electric', 'grass', 'ground'], immunities: [] },
  ice: { weaknesses: ['fire', 'fighting', 'rock', 'steel'], resistances: ['ice'], immunities: [] },
  fighting: { weaknesses: ['flying', 'psychic', 'fairy'], resistances: ['bug', 'rock', 'dark'], immunities: [] },
  poison: { weaknesses: ['ground', 'psychic'], resistances: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immunities: [] },
  ground: { weaknesses: ['water', 'grass', 'ice'], resistances: ['poison', 'rock'], immunities: ['electric'] },
  flying: { weaknesses: ['electric', 'ice', 'rock'], resistances: ['grass', 'fighting', 'bug'], immunities: ['ground'] },
  psychic: { weaknesses: ['bug', 'ghost', 'dark'], resistances: ['fighting', 'psychic'], immunities: [] },
  bug: { weaknesses: ['fire', 'flying', 'rock'], resistances: ['grass', 'fighting', 'ground'], immunities: [] },
  rock: { weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'], resistances: ['normal', 'fire', 'poison', 'flying'], immunities: [] },
  ghost: { weaknesses: ['ghost', 'dark'], resistances: ['poison', 'bug'], immunities: ['normal', 'fighting'] },
  dragon: { weaknesses: ['ice', 'dragon', 'fairy'], resistances: ['fire', 'water', 'electric', 'grass'], immunities: [] },
  dark: { weaknesses: ['fighting', 'bug', 'fairy'], resistances: ['ghost', 'dark'], immunities: ['psychic'] },
  steel: { weaknesses: ['fire', 'fighting', 'ground'], resistances: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunities: ['poison'] },
  fairy: { weaknesses: ['poison', 'steel'], resistances: ['fighting', 'bug', 'dark'], immunities: ['dragon'] },
};

export const TYPES = Object.keys(TYPE_MATCHUPS);

// Helper function to calculate offensive advantages based on the defender matrix
export const getOffensiveMatchups = (attacker) => {
  const superEffective = [];
  const notVeryEffective = [];
  const noEffect = [];

  for (const [defender, matchup] of Object.entries(TYPE_MATCHUPS)) {
    if (matchup.weaknesses.includes(attacker)) superEffective.push(defender);
    if (matchup.resistances.includes(attacker)) notVeryEffective.push(defender);
    if (matchup.immunities.includes(attacker)) noEffect.push(defender);
  }

  return { superEffective, notVeryEffective, noEffect };
};
