import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import Editor from "@monaco-editor/react";

interface DiffViewerProps {
  repoPath: string;
  commitHash: string;
  filePath: string;
  fileName: string;
}

type ViewMode = 'monaco' | 'basic';

export function DiffViewer({ repoPath, commitHash, filePath, fileName }: DiffViewerProps) {
  const [diff, setDiff] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('monaco');
  const editorRef = useRef<any>(null);

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

  // Detect language from file extension for syntax highlighting
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'sh': 'shell',
      'yml': 'yaml',
      'yaml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'toml': 'ini',
      'lock': 'json',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

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

  // Parse the diff into lines for stats
  const lines = diff.split('\n');
  const additions = lines.filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
  const deletions = lines.filter(l => l.startsWith('-') && !l.startsWith('---')).length;

  // Detect language for syntax highlighting
  const language = getLanguage(fileName);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Diff Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-xs font-semibold">DIFF</span>
            <span className="text-zinc-500 text-xs">•</span>
            <span className="text-zinc-300 text-xs font-mono truncate">{fileName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500">
              <span className="text-green-400">+{additions}</span>
              {' / '}
              <span className="text-red-400">-{deletions}</span>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'monaco' ? 'basic' : 'monaco')}
              className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors font-medium"
              title={viewMode === 'monaco' ? "Switch to basic view" : "Switch to Monaco editor"}
            >
              {viewMode === 'monaco' ? '📝 Basic' : '✨ Monaco'}
            </button>
          </div>
        </div>
      </div>

      {/* Diff Content */}
      {viewMode === 'monaco' ? (
        <div className="h-[600px]">
          <Editor
            height="100%"
            width="100%"
            language={language}
            value={diff}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              renderLineHighlight: 'none',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              overviewRulerBorder: false,
              wordWrap: 'off',
              folding: true,
              glyphMargin: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
            }}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              
              // Add custom decorations for diff highlighting
              const model = editor.getModel();
              if (!model) return;

              const decorations: any[] = [];
              const lines = model.getLinesContent();

              lines.forEach((line, index) => {
                const lineNumber = index + 1;
                
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  decorations.push({
                    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                    options: {
                      isWholeLine: true,
                      className: 'diff-addition-line',
                      linesDecorationsClassName: 'diff-addition-glyph',
                    },
                  });
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  decorations.push({
                    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                    options: {
                      isWholeLine: true,
                      className: 'diff-deletion-line',
                      linesDecorationsClassName: 'diff-deletion-glyph',
                    },
                  });
                } else if (line.startsWith('@@')) {
                  decorations.push({
                    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                    options: {
                      isWholeLine: true,
                      className: 'diff-hunk-line',
                    },
                  });
                } else if (line.startsWith('diff --git') || line.startsWith('index ') || 
                           line.startsWith('---') || line.startsWith('+++')) {
                  decorations.push({
                    range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                    options: {
                      isWholeLine: true,
                      className: 'diff-header-line',
                    },
                  });
                }
              });

              editor.createDecorationsCollection(decorations);
            }}
          />
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <div className="font-mono text-xs">
            {lines.map((line, idx) => {
              let bgColor = 'bg-zinc-900';
              let textColor = 'text-zinc-300';
              let lineMarker = ' ';

              if (line.startsWith('+++') || line.startsWith('---')) {
                bgColor = 'bg-zinc-800';
                textColor = 'text-zinc-400';
                lineMarker = ' ';
              } else if (line.startsWith('@@')) {
                bgColor = 'bg-cyan-950';
                textColor = 'text-cyan-300';
                lineMarker = '@';
              } else if (line.startsWith('+')) {
                bgColor = 'bg-green-950 bg-opacity-40';
                textColor = 'text-green-300';
                lineMarker = '+';
              } else if (line.startsWith('-')) {
                bgColor = 'bg-red-950 bg-opacity-40';
                textColor = 'text-red-300';
                lineMarker = '-';
              } else if (line.startsWith('diff --git') || line.startsWith('index ')) {
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
      )}
    </div>
  );
}
