// PatientRecordsView.tsx
import React from "react";

type Note = { date: string; content: string };

export default function PatientRecordsView({ notes }: { notes: Note[] }) {
  return (
    <div className="space-y-3">
      {notes.length ? (
        notes.map((note, i) => (
          <div key={i} className="border rounded p-3 bg-white shadow-sm">
            <p className="text-sm text-gray-500">{new Date(note.date).toLocaleString()}</p>
            <p className="mt-1 text-gray-800">{note.content}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No notes yet.</p>
      )}
    </div>
  );
}
