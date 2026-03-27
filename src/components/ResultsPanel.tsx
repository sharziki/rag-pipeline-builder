import { MessageSquare, Target } from 'lucide-react';
import type { RetrievalResult } from '../lib/rag';

interface ResultsPanelProps {
  retrievedChunks: RetrievalResult[];
  generatedResponse: string;
}

export function ResultsPanel({
  retrievedChunks,
  generatedResponse,
}: ResultsPanelProps) {
  if (retrievedChunks.length === 0 && !generatedResponse) {
    return (
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Results
        </h2>
        <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm">
          Run the pipeline to see retrieval results and generated response.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Retrieved Chunks */}
      <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Retrieved Chunks ({retrievedChunks.length})
        </h2>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {retrievedChunks.map((result, index) => (
            <div
              key={result.chunk.id}
              className="p-3 bg-[hsl(var(--secondary))] rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[hsl(var(--foreground))]">
                  Chunk #{index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-[#ef4444] to-[#22c55e]"
                    style={{
                      width: `${result.similarity * 60}px`,
                    }}
                  />
                  <span
                    className="text-xs font-mono"
                    style={{
                      color:
                        result.similarity > 0.7
                          ? '#22c55e'
                          : result.similarity > 0.5
                          ? '#f59e0b'
                          : '#ef4444',
                    }}
                  >
                    {(result.similarity * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-3">
                {result.chunk.content}
              </p>
              <div className="flex gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Doc: {result.chunk.documentId}</span>
                <span>Tokens: ~{result.chunk.tokenCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Response */}
      {generatedResponse && (
        <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
          <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Generated Response
          </h2>

          <div className="p-3 bg-[hsl(var(--secondary))] rounded-lg">
            <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-wrap">
              {generatedResponse}
            </p>
          </div>
        </div>
      )}

      {/* Embedding Visualization */}
      {retrievedChunks.length > 0 && (
        <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
          <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
            Embedding Vectors (Simplified 2D Projection)
          </h2>

          <div className="relative h-[200px] bg-[hsl(var(--secondary))] rounded-lg overflow-hidden">
            {/* Grid lines */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-[hsl(var(--border))] opacity-30"
                />
              ))}
            </div>

            {/* Query point */}
            <div
              className="absolute w-4 h-4 bg-[#f59e0b] rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-[#f59e0b]/50"
              style={{
                left: '50%',
                top: '50%',
              }}
              title="Query"
            />

            {/* Chunk points */}
            {retrievedChunks.map((result, index) => {
              // Project embedding to 2D using first 2 dimensions
              const x = (result.embedding.vector[0] + 1) * 50;
              const y = (result.embedding.vector[1] + 1) * 50;

              return (
                <div
                  key={result.chunk.id}
                  className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150"
                  style={{
                    left: `${Math.min(95, Math.max(5, x))}%`,
                    top: `${Math.min(95, Math.max(5, y))}%`,
                    backgroundColor:
                      result.similarity > 0.7
                        ? '#22c55e'
                        : result.similarity > 0.5
                        ? '#f59e0b'
                        : '#ef4444',
                    opacity: 0.5 + result.similarity * 0.5,
                  }}
                  title={`Chunk ${index + 1}: ${(result.similarity * 100).toFixed(1)}% similarity`}
                />
              );
            })}

            <div className="absolute bottom-2 left-2 text-xs text-[hsl(var(--muted-foreground))]">
              Query (yellow) • Chunks (similarity-colored)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
