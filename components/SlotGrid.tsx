type Slot = { start: string; end: string };
export default function SlotGrid({ slots, onPick }: { slots: Slot[]; onPick: (s: Slot)=>void }) {
  if (!slots?.length) return <p className="text-sm text-gray-500">No free slots in this window.</p>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {slots.map((s, i) => {
        const t = new Date(s.start);
        const label = t.toLocaleString();
        return (
          <button key={i} onClick={()=>onPick(s)}
                  className="rounded-md border px-3 py-2 text-sm hover:bg-brand-50 hover:border-brand-300">
            {label}
          </button>
        );
      })}
    </div>
  );
}
