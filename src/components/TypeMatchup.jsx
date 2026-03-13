import React, { useState } from 'react';
import { TYPE_COLORS, TYPE_MATCHUPS, TYPES, getOffensiveMatchups } from '../data/types';

export default function TypeMatchup() {
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState('defense');

  const getMatchType = (type) => {
    if (!selectedType) return null;
    if (type === selectedType) return 'selected';
    
    if (viewMode === 'defense') {
      const matchup = TYPE_MATCHUPS[selectedType];
      if (matchup.weaknesses.includes(type)) return 'def_weak'; // 2x damage taken
      if (matchup.resistances.includes(type)) return 'resist'; // 0.5x damage taken
      if (matchup.immunities.includes(type)) return 'immune'; // 0x damage taken
    } else {
      const matchup = getOffensiveMatchups(selectedType);
      if (matchup.superEffective.includes(type)) return 'off_strong'; // 2x damage dealt (use blue)
      if (matchup.notVeryEffective.includes(type)) return 'resist'; // 0.5x damage dealt
      if (matchup.noEffect.includes(type)) return 'immune'; // 0x damage dealt
    }
    
    return 'neutral';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-400 text-sm">
          Select a type to see its {viewMode === 'defense' ? 'weaknesses and resistances' : 'offensive advantages'}.
        </p>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => setViewMode('defense')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'defense' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Defender
          </button>
          <button 
            onClick={() => setViewMode('offense')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${viewMode === 'offense' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Attacker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2 mb-6">
        {TYPES.map((type) => {
          const matchType = getMatchType(type);
          
          let stateClasses = 'opacity-100 hover:scale-105 transition-transform cursor-pointer border-transparent';
          
          if (selectedType) {
            if (type === selectedType) {
              stateClasses = 'ring-2 ring-white scale-105 border-white opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.5)]';
            } else if (matchType === 'def_weak') {
              stateClasses = 'opacity-100 ring-2 ring-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] scale-105';
            } else if (matchType === 'off_strong') {
              stateClasses = 'opacity-100 ring-2 ring-blue-500 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] scale-105';
            } else if (matchType === 'resist') {
              stateClasses = 'opacity-60 ring-2 ring-green-500 border-green-500';
            } else if (matchType === 'immune') {
              stateClasses = 'opacity-30 grayscale border-transparent';
            } else {
              stateClasses = 'opacity-40 grayscale-[50%] border-transparent';
            }
          }

          return (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`${TYPE_COLORS[type]} text-white text-xs font-bold uppercase tracking-wider py-2 px-1 rounded-lg border-2 shadow-md flex items-center justify-center transition-all duration-300 ${stateClasses}`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {selectedType && (() => {
        const data = viewMode === 'defense' 
          ? {
              title: `${selectedType} Defenses`,
              twoX: TYPE_MATCHUPS[selectedType].weaknesses,
              halfX: TYPE_MATCHUPS[selectedType].resistances,
              zeroX: TYPE_MATCHUPS[selectedType].immunities
            }
          : {
              title: `${selectedType} Attacks`,
              twoX: getOffensiveMatchups(selectedType).superEffective,
              halfX: getOffensiveMatchups(selectedType).notVeryEffective,
              zeroX: getOffensiveMatchups(selectedType).noEffect
            };

        return (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mt-4">
            <h3 className="text-white font-bold capitalize mb-3 text-center">
              {data.title}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center">
                <span className="w-10 text-red-400 font-bold text-right mr-3 whitespace-nowrap">{viewMode === 'defense' ? '-2x' : '2x'}</span>
                <div className="flex flex-wrap gap-1">
                  {data.twoX.length ? 
                    data.twoX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic">None</span>
                  }
                </div>
              </div>
              
              <div className="flex items-center">
                <span className="w-10 text-green-400 font-bold text-right mr-3 whitespace-nowrap">{viewMode === 'defense' ? '-0.5x' : '0.5x'}</span>
                <div className="flex flex-wrap gap-1">
                  {data.halfX.length ? 
                    data.halfX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic">None</span>
                  }
                </div>
              </div>

              <div className="flex items-center">
                <span className="w-10 text-slate-400 font-bold text-right mr-3">0x</span>
                <div className="flex flex-wrap gap-1">
                  {data.zeroX.length ? 
                    data.zeroX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic">None</span>
                  }
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
