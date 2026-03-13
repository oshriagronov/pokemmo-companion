import React, { useState, useEffect, useRef } from 'react';
import { fetchPokemonData, fetchAllPokemonNames } from '../services/pokeapi';
import { TYPE_COLORS } from '../data/types';

export default function PokemonSearch() {
  const [query, setQuery] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [allNames, setAllNames] = useState([]);
  const [filteredNames, setFilteredNames] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAllPokemonNames().then(names => setAllNames(names));
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = allNames.filter(name => name.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
      setFilteredNames(filtered);
      setShowDropdown(true);
    } else {
      setFilteredNames([]);
      setShowDropdown(false);
    }
  };

  const executeSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setPokemon(null);
    setShowDropdown(false);

    const data = await fetchPokemonData(searchQuery);
    
    if (data) {
      setPokemon(data);
    } else {
      setError('Pokemon not found. Please check spelling or ID.');
    }
    
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const selectSuggestion = (name) => {
    setQuery(name);
    executeSearch(name);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Pokemon Lookup</h2>
      
      <form onSubmit={handleSearch} className="relative mb-6" ref={dropdownRef}>
        <input 
          type="text" 
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (filteredNames.length > 0) setShowDropdown(true); }}
          placeholder="Search by name or number (e.g., pikachu, 25)..." 
          className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-3 md:px-4 py-3 md:py-4 pr-24 text-sm md:text-base text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white font-medium rounded-lg transition-colors z-20 text-sm md:text-base"
        >
          {loading ? '...' : 'Search'}
        </button>

        {/* Autocomplete Dropdown */}
        {showDropdown && filteredNames.length > 0 && (
          <ul className="absolute z-30 w-full mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-700/50">
            {filteredNames.map(name => (
              <li 
                key={name}
                onClick={() => selectSuggestion(name)}
                className="px-4 py-3 text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer transition-colors capitalize"
              >
                {name.replace('-', ' ')}
              </li>
            ))}
          </ul>
        )}
      </form>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {pokemon && (
        <div className="animate-fade-in">
          {/* Header Row: Sprite and Basic Stats */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 text-center md:text-left">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex justify-center items-center relative overflow-hidden group w-full max-w-[240px] md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {pokemon.sprites.front ? (
                <img src={pokemon.sprites.front} alt={pokemon.name} className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl z-10 hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center text-slate-500">No Image</div>
              )}
            </div>
            
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-3 md:mb-2 gap-1 sm:gap-0">
                <h3 className="text-3xl md:text-4xl font-extrabold text-white capitalize">{pokemon.name}</h3>
                <span className="text-xl md:text-2xl font-bold text-slate-500">#{pokemon.id.toString().padStart(3, '0')}</span>
              </div>
              
              <div className="flex justify-center md:justify-start gap-2 mb-6 md:mb-4">
                {pokemon.types.map(t => (
                  <span key={t} className={`${TYPE_COLORS[t] || 'bg-slate-500'} px-3 py-1 rounded-full text-xs font-bold uppercase text-white shadow-lg`}>
                    {t}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-2 gap-x-4 gap-y-2 text-sm w-full mx-auto md:mx-0 max-w-sm md:max-w-none">
                {pokemon.stats.map(s => (
                  <div key={s.name} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                    <span className="text-slate-400 capitalize">{s.name.replace('Special', 'Sp.')}</span>
                    <span className="font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Evolutions */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-emerald-400 mb-3 border-b border-slate-700 pb-2">Evolution Chain</h4>
              {pokemon.evolutions.length > 0 ? (
                <div className="space-y-3">
                  {pokemon.evolutions.map((evo, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <span className={`font-bold ${evo.species === pokemon.name ? 'text-white' : 'text-slate-300'}`}>
                        {evo.species}
                      </span>
                      {evo.requirement && (
                        <span className="ml-auto text-xs bg-slate-800 px-2 py-1 rounded text-emerald-300 border border-emerald-900/50">
                          {evo.requirement}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">Does not evolve.</p>
              )}
            </div>

            {/* Encounters */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-bold text-orange-400 mb-3 border-b border-slate-700 pb-2">Wild Encounters</h4>
              {pokemon.encounters.length > 0 ? (
                <ul className="space-y-2">
                  {pokemon.encounters.map((enc, i) => (
                    <li key={i} className="text-sm flex justify-between">
                      <span className="text-slate-300 truncate pr-2">{enc.location.replace('Area', '')}</span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">{enc.methods.join(', ')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-400 text-sm">Cannot be caught in the wild.</p>
              )}
            </div>

            {/* Best & Early Moves */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold text-purple-400 mb-3 border-b border-slate-700 pb-2">Notable Late-Game Moves</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pokemon.bestMoves.map((m, i) => (
                    <div key={i} className="bg-slate-800 p-2 rounded flex flex-col items-center justify-center text-center">
                      <span className="text-white font-bold text-sm capitalize">{m.name.replace('-', ' ')}</span>
                      <span className="text-xs text-purple-300 mt-1">Learned at Lv. {m.level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {pokemon.earlyMoves.length > 0 && (
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <h4 className="font-bold text-blue-400 mb-3 border-b border-slate-700 pb-2">Honorable Mentions (Early/Mid Game)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {pokemon.earlyMoves.map((m, i) => (
                      <div key={i} className="bg-slate-800 p-2 rounded flex flex-col items-center justify-center text-center opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-white font-bold text-sm capitalize">{m.name.replace('-', ' ')}</span>
                        <span className="text-xs text-blue-300 mt-1">Learned at Lv. {m.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
