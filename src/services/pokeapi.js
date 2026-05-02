const BASE_URL = 'https://pokeapi.co/api/v2';

let cachedPokemonNamesPromise = null;
const pokemonDataCache = new Map();
const CACHE_LIMIT = 100;

export async function fetchAllPokemonNames() {
  if (cachedPokemonNamesPromise) {
    return cachedPokemonNamesPromise;
  }

  cachedPokemonNamesPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/pokemon?limit=1500`);
      if (!res.ok) {
        cachedPokemonNamesPromise = null;
        return [];
      }
      const data = await res.json();
      return data.results.map(p => p.name);
    } catch {
      cachedPokemonNamesPromise = null;
      return [];
    }
  })();

  return cachedPokemonNamesPromise;
}

export async function fetchPokemonData(query) {
  const formattedQuery = (typeof query === 'string' ? query : String(query)).toLowerCase().trim();
  if (!formattedQuery) return null;

  if (pokemonDataCache.has(formattedQuery)) {
    const cachedPromise = pokemonDataCache.get(formattedQuery);
    // Move to the end to maintain LRU order
    pokemonDataCache.delete(formattedQuery);
    pokemonDataCache.set(formattedQuery, cachedPromise);
    return cachedPromise;
  }

  const promise = (async () => {
    try {
      // 1. Fetch Basic Info & Moves
      const basicRes = await fetch(`${BASE_URL}/pokemon/${encodeURIComponent(formattedQuery)}`);
      if (!basicRes.ok) throw new Error('Pokemon not found');
      const basicData = await basicRes.json();

      // 2. Fetch Species (for flavor text and evolution chain) and Encounters concurrently
      const [{ evolutions }, encounters] = await Promise.all([
        (async () => {
          let evolutions = [];

          const speciesRes = await fetch(basicData.species.url);
          const speciesData = speciesRes.ok ? await speciesRes.json() : null;

          if (speciesData && speciesData.evolution_chain) {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            if (evoRes.ok) {
              const evoData = await evoRes.json();
              evolutions = parseEvolutionChain(evoData.chain);
            }
          }

          return { evolutions };
        })(),
        (async () => {
          let encounters = [];

          const encRes = await fetch(`${BASE_URL}/pokemon/${basicData.id}/encounters`);
          if (encRes.ok) {
            const encData = await encRes.json();
            encounters = encData.slice(0, 5).map(e => ({
              location: formatName(e.location_area.name),
              methods: [...new Set(e.version_details.flatMap(v => v.encounter_details.map(d => d.method.name)))]
            })); // Limit to top 5 locations
          }

          return encounters;
        })()
      ]);

      // Filter "Best Moves" heuristically (e.g. by level-up)
      const sortedLevelUpMoves = basicData.moves
        .reduce((acc, m) => {
          const details = m.version_group_details.find(v => v.move_learn_method.name === 'level-up');
          if (details) {
            acc.push({
              name: formatName(m.move.name),
              level: details.level_learned_at
            });
          }
          return acc;
        }, [])
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

    } catch (err) {

      pokemonDataCache.delete(formattedQuery);
      return null;
    }
  })();

  pokemonDataCache.set(formattedQuery, promise);

  // Enforce cache limit
  if (pokemonDataCache.size > CACHE_LIMIT) {
    const firstKey = pokemonDataCache.keys().next().value;
    pokemonDataCache.delete(firstKey);
  }

  return promise;
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
