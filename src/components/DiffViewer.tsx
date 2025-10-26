import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface DiffViewerProps {
  repoPath: string;
  commitHash: string;
  filePath: string;
  fileName: string;
}

export function DiffViewer({ repoPath, commitHash, filePath, fileName }: DiffViewerProps) {
  const [diff, setDiff] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    invoke<string>("get_file_diff", {
      path: repoPath,
      commitHash: commitHash,
      filePath: filePath,
    })
      .then((diffText) => {
        setDiff(diffText);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [repoPath, commitHash, filePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        Loading diff...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 bg-red-950 border border-red-800 rounded text-red-200 text-xs">
          <strong>Error loading diff:</strong> {error}
        </div>
      </div>
    );
  }

  if (!diff || diff.trim() === "") {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
        No diff available for this file
      </div>
    );
  }

  // Parse the diff into lines
  const lines = diff.split('\n');

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Diff Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400 text-xs font-semibold">DIFF</span>
          <span className="text-zinc-500 text-xs">•</span>
          <span className="text-zinc-300 text-xs font-mono truncate">{fileName}</span>
        </div>
        <div className="text-xs text-zinc-500">
          {lines.filter(l => l.startsWith('+')).length} additions, {lines.filter(l => l.startsWith('-')).length} deletions
        </div>
      </div>

      {/* Diff Content */}
      <div className="overflow-x-auto">
        <div className="font-mono text-xs">
          {lines.map((line, idx) => {
            let bgColor = 'bg-zinc-900';
            let textColor = 'text-zinc-300';
            let lineMarker = ' ';

            if (line.startsWith('+++') || line.startsWith('---')) {
              // File headers
              bgColor = 'bg-zinc-800';
              textColor = 'text-zinc-400';
              lineMarker = ' ';
            } else if (line.startsWith('@@')) {
              // Hunk headers
              bgColor = 'bg-cyan-950';
              textColor = 'text-cyan-300';
              lineMarker = '@';
            } else if (line.startsWith('+')) {
              // Added lines
              bgColor = 'bg-green-950 bg-opacity-40';
              textColor = 'text-green-300';
              lineMarker = '+';
            } else if (line.startsWith('-')) {
              // Deleted lines
              bgColor = 'bg-red-950 bg-opacity-40';
              textColor = 'text-red-300';
              lineMarker = '-';
            } else if (line.startsWith('diff --git') || line.startsWith('index ')) {
              // Git metadata
              bgColor = 'bg-zinc-800';
              textColor = 'text-zinc-500';
              lineMarker = ' ';
            }

            return (
              <div
                key={idx}
                className={`${bgColor} ${textColor} flex hover:bg-opacity-60 transition-colors`}
              >
                <span className="w-8 flex-shrink-0 text-center text-zinc-600 select-none border-r border-zinc-800">
                  {idx + 1}
                </span>
                <span className="w-4 flex-shrink-0 text-center select-none opacity-60">
                  {lineMarker}
                </span>
                <pre className="flex-1 px-2 py-0.5 whitespace-pre overflow-x-auto">
                  {line || ' '}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
