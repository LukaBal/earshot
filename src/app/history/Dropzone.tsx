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
      className={`${
        compact
          ? "btn btn-primary cursor-pointer"
          : `card flex cursor-pointer flex-col items-center justify-center border-dashed px-6 py-16 text-center transition-colors duration-200 ${
              dragging ? "border-accent bg-accent-deep/20" : "hover:border-line-strong"
            }`
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
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
        <span>{busy ? "Reading…" : "Add files"}</span>
      ) : (
        <>
          <span className="font-display text-3xl font-medium text-foreground">
            {busy ? "Reading your history…" : "Drop your streaming history here"}
          </span>
          <span className="mt-3 text-sm text-muted">
            <code className="text-foreground">Streaming_History_Audio_*.json</code> or{" "}
            <code className="text-foreground">StreamingHistory_music_*.json</code>. Select them all at once.
          </span>
          <span className="btn btn-primary mt-8">Choose files</span>
        </>
      )}
    </label>
  );
}
