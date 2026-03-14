import test from 'node:test';
import assert from 'node:assert';
import { fetchPokemonData } from './pokeapi.js';

test('fetchPokemonData uses encodeURIComponent', async (t) => {
  const originalFetch = global.fetch;
  let fetchUrl = '';
  global.fetch = async (url) => {
    if (!fetchUrl) fetchUrl = url;
    return {
      ok: true,
      json: async () => {
        if (url.includes('/encounters')) {
            return [];
        }
        if (url.includes('evolution_chain')) {
            return {
                chain: {
                    species: { name: 'test' },
                    evolves_to: []
                }
            }
        }
        return {
          id: 1,
          name: 'test',
          sprites: { other: { 'official-artwork': { front_default: '' } }, front_default: '' },
          types: [],
          stats: [],
          moves: [],
          species: { url: 'species_url' },
          evolution_chain: { url: 'evolution_chain_url' }
        };
      }
    };
  };

  try {
    await fetchPokemonData('test name / ? #');
    assert.strictEqual(
      fetchUrl.includes('test%20name%20%2F%20%3F%20%23'),
      true,
      'URL should contain encoded query parameters'
    );
  } finally {
    global.fetch = originalFetch;
  }
});
