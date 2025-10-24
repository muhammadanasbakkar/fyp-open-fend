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
          <div key={i} className="border rounded p-3 bg-white shadow-sm">
            <p className="text-sm text-gray-500">
              {ts && !isNaN(+ts) ? ts.toLocaleString() : "Unknown date"}
            </p>
            <p className="mt-1 text-gray-800">{note?.content ?? ""}</p>
          </div>
        );
      })}
    </div>
  );
}
