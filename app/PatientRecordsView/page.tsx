// components/PatientRecordsView.tsx
import React from "react";

// export type Note = { date: string; content: string };

// type Props = {
//   notes?: Note[]; // allow undefined, default to []
// };

export default function PatientRecordsView({ notes = [] }: any) {
  if (!notes.length) {
    return <p className="text-gray-500 text-sm">No notes yet.</p>;
  }

  return (
    <div className="space-y-3">
      {notes.map((note: any, i: number) => {
        const ts = note?.date ? new Date(note.date) : null;
        return (
          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400">
              {ts && !isNaN(+ts) ? ts.toLocaleString() : "Unknown date"}
            </p>
            <p className="mt-1.5 text-sm text-gray-800 leading-relaxed">{note?.content ?? ""}</p>
          </div>
        );
      })}
    </div>
  );
}
