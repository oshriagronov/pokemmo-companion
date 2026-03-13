import React from 'react';
import TypeMatchup from './components/TypeMatchup';
import PokemonSearch from './components/PokemonSearch';

function App() {
  return (
    <div className="min-h-screen container mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-4 drop-shadow-lg">
          PokeMMO Companion
        </h1>
        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
          Your ultimate companion for PokeMMO. Discover type matchups, encounter locations, evolutions, and the best moves for every Pokemon.
        </p>
      </header>

      {/* Main Content Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Type Matchup Section */}
        <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Type Matchups</h2>
          <TypeMatchup />
        </div>

        {/* Search & Details Section */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 shadow-xl min-h-[500px]">
          <PokemonSearch />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-500 text-xs md:text-sm py-6 md:py-8 border-t border-slate-800/80">
        <p>
          I would like to thank <a href="https://pokeapi.co/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors" target="_blank" rel="noreferrer">PokeAPI</a> for providing the data. Built with <span className="text-emerald-400 font-bold tracking-wide">Google Antigravity</span> for the PokeMMO community.
        </p>
      </footer>
    </div>
  );
}

export default App;
