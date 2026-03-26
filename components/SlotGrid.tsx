type Slot = { start: string; end: string };
export default function SlotGrid({ slots, onPick }: { slots: Slot[]; onPick: (s: Slot)=>void }) {
  if (!slots?.length) return <p className="text-sm text-gray-500">No free slots in this window.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {slots.map((s, i) => {
        const t = new Date(s.start);
        const label = t.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        const date = t.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        return (
          <button key={i} onClick={() => onPick(s)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition-all hover:border-[#4b7eff] hover:bg-[#4b7eff]/5 hover:text-[#4b7eff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4b7eff]">
            <div className="font-semibold">{label}</div>
            <div className="text-xs text-gray-400">{date}</div>
          </button>
        );
      })}
    </div>
  );
}
