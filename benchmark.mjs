const { TYPE_MATCHUPS, TYPES } = await import('./src/data/types.js');

function benchmarkOriginal() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const OFFENSIVE_MATCHUPS_CACHE = {};
    for (const attacker of TYPES) {
      const superEffective = [];
      const notVeryEffective = [];
      const noEffect = [];

      for (const [defender, matchup] of Object.entries(TYPE_MATCHUPS)) {
        if (matchup.weaknesses.includes(attacker)) superEffective.push(defender);
        if (matchup.resistances.includes(attacker)) notVeryEffective.push(defender);
        if (matchup.immunities.includes(attacker)) noEffect.push(defender);
      }

      OFFENSIVE_MATCHUPS_CACHE[attacker] = { superEffective, notVeryEffective, noEffect };
    }
  }
  const end = performance.now();
  return end - start;
}

function benchmarkOptimized() {
  const start = performance.now();
  for (let i = 0; i < 10000; i++) {
    const OFFENSIVE_MATCHUPS_CACHE = {};
    const typeMatchupsEntries = Object.entries(TYPE_MATCHUPS);
    for (const attacker of TYPES) {
      const superEffective = [];
      const notVeryEffective = [];
      const noEffect = [];

      for (const [defender, matchup] of typeMatchupsEntries) {
        if (matchup.weaknesses.includes(attacker)) superEffective.push(defender);
        if (matchup.resistances.includes(attacker)) notVeryEffective.push(defender);
        if (matchup.immunities.includes(attacker)) noEffect.push(defender);
      }

      OFFENSIVE_MATCHUPS_CACHE[attacker] = { superEffective, notVeryEffective, noEffect };
    }
  }
  const end = performance.now();
  return end - start;
}

// Warmup
benchmarkOriginal();
benchmarkOptimized();

const orig = benchmarkOriginal();
const opt = benchmarkOptimized();

console.log(`Original: ${orig.toFixed(2)}ms`);
console.log(`Optimized: ${opt.toFixed(2)}ms`);
console.log(`Improvement: ${((orig - opt) / orig * 100).toFixed(2)}%`);
