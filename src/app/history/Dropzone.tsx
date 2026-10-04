"use client";

import { useState } from "react";

export function Dropzone({ onFiles, busy, compact = false }: { onFiles: (files: File[]) => void; busy: boolean; compact?: boolean }) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onFiles([...e.dataTransfer.files]);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed text-center transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-line-strong hover:border-accent/60"
      } ${compact ? "px-4 py-2.5 text-sm" : "px-6 py-16"} ${busy ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        type="file"
        accept=".json,application/json"
        multiple
        className="sr-only"
        onChange={(e) => {
          onFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />
      {compact ? (
        <span className="font-medium">{busy ? "Reading…" : "+ Add files"}</span>
      ) : (
        <>
          <span className="font-display text-2xl font-bold tracking-tight">
            {busy ? "Reading your history…" : "Drop your streaming history here"}
          </span>
          <span className="mt-2 text-muted">
            <code className="text-foreground">Streaming_History_Audio_*.json</code> or{" "}
            <code className="text-foreground">StreamingHistory_music_*.json</code>. Select them all at once.
          </span>
          <span className="mt-6 rounded-full bg-accent px-5 py-2 font-semibold text-black">Choose files</span>
        </>
      )}
    </label>
  );
}
