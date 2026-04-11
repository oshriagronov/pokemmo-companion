export default function MoveList({ title, moves, titleColor, levelColor, itemClass = "" }) {
  if (!moves || moves.length === 0) return null;

  return (
    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
      <h4 className={`font-bold ${titleColor} mb-3 border-b border-slate-700 pb-2`}>{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {moves.map((m, i) => (
          <div key={i} className={`bg-slate-800 p-2 rounded flex flex-col items-center justify-center text-center ${itemClass}`}>
            <span className="text-white font-bold text-sm capitalize">{m.name.replace('-', ' ')}</span>
            <span className={`text-xs ${levelColor} mt-1`}>Learned at Lv. {m.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
