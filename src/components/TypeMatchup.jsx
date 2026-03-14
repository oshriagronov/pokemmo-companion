import React, { useState, useMemo } from 'react';
import { TYPE_COLORS, TYPE_MATCHUPS, TYPES, getOffensiveMatchups } from '../data/types';

export default function TypeMatchup() {
  const [selectedType, setSelectedType] = useState(null);
  const [viewMode, setViewMode] = useState('defense');

  const offensiveMatchups = useMemo(() => selectedType ? getOffensiveMatchups(selectedType) : null, [selectedType]);

  const getMatchType = (type) => {
    if (!selectedType) return null;
    if (type === selectedType) return 'selected';
    
    if (viewMode === 'defense') {
      const matchup = TYPE_MATCHUPS[selectedType];
      if (matchup.weaknesses.includes(type)) return 'def_weak'; // 2x damage taken
      if (matchup.resistances.includes(type)) return 'resist'; // 0.5x damage taken
      if (matchup.immunities.includes(type)) return 'immune'; // 0x damage taken
    } else {
      const matchup = offensiveMatchups;
      if (matchup.superEffective.includes(type)) return 'off_strong'; // 2x damage dealt (use blue)
      if (matchup.notVeryEffective.includes(type)) return 'resist'; // 0.5x damage dealt
      if (matchup.noEffect.includes(type)) return 'immune'; // 0x damage dealt
    }
    
    return 'neutral';
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 sm:gap-0 mb-6 text-center sm:text-left">
        <p className="text-slate-400 text-sm max-w-xs">
          Select a type to see its {viewMode === 'defense' ? 'weaknesses and resistances' : 'offensive advantages'}.
        </p>
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 w-full sm:w-auto justify-center">
          <button 
            onClick={() => setViewMode('defense')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-md transition-colors ${viewMode === 'defense' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Defender
          </button>
          <button 
            onClick={() => setViewMode('offense')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs md:text-sm font-bold rounded-md transition-colors ${viewMode === 'offense' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Attacker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-2 mb-6">
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
              twoX: offensiveMatchups.superEffective,
              halfX: offensiveMatchups.notVeryEffective,
              zeroX: offensiveMatchups.noEffect
            };

        return (
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mt-4">
            <h3 className="text-white font-bold capitalize mb-3 text-center">
              {data.title}
            </h3>
            <div className="space-y-3 text-sm max-w-sm mx-auto sm:max-w-none">
              <div className="flex items-start sm:items-center">
                <span className="w-12 sm:w-16 text-red-400 font-bold text-right mr-3 whitespace-nowrap pt-0.5 sm:pt-0">{viewMode === 'defense' ? '-2x' : '2x'}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {data.twoX.length ? 
                    data.twoX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] sm:text-xs text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic mt-0.5 sm:mt-0 pt-0.5 sm:pt-0">None</span>
                  }
                </div>
              </div>
              
              <div className="flex items-start sm:items-center">
                <span className="w-12 sm:w-16 text-green-400 font-bold text-right mr-3 whitespace-nowrap pt-0.5 sm:pt-0">{viewMode === 'defense' ? '-0.5x' : '0.5x'}</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {data.halfX.length ? 
                    data.halfX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] sm:text-xs text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic mt-0.5 sm:mt-0 pt-0.5 sm:pt-0">None</span>
                  }
                </div>
              </div>

              <div className="flex items-start sm:items-center">
                <span className="w-12 sm:w-16 text-slate-400 font-bold text-right mr-3 pt-0.5 sm:pt-0">0x</span>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {data.zeroX.length ? 
                    data.zeroX.map(t => (
                      <span key={t} className={`${TYPE_COLORS[t]} px-2 py-0.5 rounded text-[10px] sm:text-xs text-white font-bold uppercase`}>{t}</span>
                    )) : <span className="text-slate-500 italic mt-0.5 sm:mt-0 pt-0.5 sm:pt-0">None</span>
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
