const BASE_URL = 'https://pokeapi.co/api/v2';

export async function fetchAllPokemonNames() {
  try {
    const res = await fetch(`${BASE_URL}/pokemon?limit=1500`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results.map(p => p.name);
  } catch (error) {
    return [];
  }
}

export async function fetchPokemonData(query) {
  try {
    const formattedQuery = query.toLowerCase().trim();
    if (!formattedQuery) return null;

    // 1. Fetch Basic Info & Moves
    const basicRes = await fetch(`${BASE_URL}/pokemon/${formattedQuery}`);
    if (!basicRes.ok) throw new Error('Pokemon not found');
    const basicData = await basicRes.json();

    // 2. Fetch Species (for flavor text and evolution chain)
    const speciesRes = await fetch(basicData.species.url);
    const speciesData = await speciesRes.ok ? await speciesRes.json() : null;

    // 3. Fetch Evolution Chain
    let evolutions = [];
    if (speciesData && speciesData.evolution_chain) {
      const evoRes = await fetch(speciesData.evolution_chain.url);
      if (evoRes.ok) {
        const evoData = await evoRes.json();
        evolutions = parseEvolutionChain(evoData.chain);
      }
    }

    // 4. Fetch Encounters
    const encRes = await fetch(`${BASE_URL}/pokemon/${basicData.id}/encounters`);
    let encounters = [];
    if (encRes.ok) {
      const encData = await encRes.json();
      encounters = encData.map(e => ({
        location: formatName(e.location_area.name),
        methods: [...new Set(e.version_details.flatMap(v => v.encounter_details.map(d => d.method.name)))]
      })).slice(0, 5); // Limit to top 5 locations
    }

    // Filter "Best Moves" heuristically (e.g. by level-up)
    const sortedLevelUpMoves = basicData.moves
      .filter(m => m.version_group_details.some(v => v.move_learn_method.name === 'level-up'))
      .map(m => {
        const details = m.version_group_details.find(v => v.move_learn_method.name === 'level-up');
        return {
          name: formatName(m.move.name),
          level: details.level_learned_at
        };
      })
      .sort((a, b) => b.level - a.level);

    const bestMoves = sortedLevelUpMoves.slice(0, 4);
    const earlyMoves = sortedLevelUpMoves.slice(4, 8); // The moves learned right before the best moves

    return {
      id: basicData.id,
      name: formatName(basicData.name),
      sprites: {
        front: basicData.sprites.other['official-artwork'].front_default || basicData.sprites.front_default
      },
      types: basicData.types.map(t => t.type.name),
      stats: basicData.stats.map(s => ({ name: formatName(s.stat.name), value: s.base_stat })),
      evolutions,
      encounters,
      bestMoves: bestMoves.length > 0 ? bestMoves : basicData.moves.slice(0, 4).map(m => ({ name: formatName(m.move.name), level: '?' })),
      earlyMoves: earlyMoves.length > 0 ? earlyMoves : []
    };

  } catch (error) {
    return null;
  }
}

function parseEvolutionChain(chainNode) {
  const evos = [];

  const traverse = (node) => {
    const speciesName = formatName(node.species.name);
    let requirement = '';

    if (node.evolution_details && node.evolution_details.length > 0) {
      const details = node.evolution_details[0];
      if (details.min_level) requirement = `Lv. ${details.min_level}`;
      else if (details.item) requirement = formatName(details.item.name);
      else if (details.min_happiness) requirement = `Happiness ${details.min_happiness}`;
      else if (details.trigger?.name === 'trade') requirement = 'Trade';
      else requirement = 'Special';
    }

    evos.push({
      species: speciesName,
      requirement
    });

    if (node.evolves_to.length > 0) {
      // Just following the first branch for simplicity in this demo if there are multiple (like Eevee), 
      // but we could map all branches. We will map all immediate branches.
      node.evolves_to.forEach(child => traverse(child));
    }
  };

  traverse(chainNode);
  return evos;
}

function formatName(str) {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
