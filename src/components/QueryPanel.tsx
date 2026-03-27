import { Search, Play, RotateCcw } from 'lucide-react';
import type { PipelineStep } from '../lib/rag';

interface QueryPanelProps {
  query: string;
  onQueryChange: (query: string) => void;
  onRunPipeline: () => void;
  onReset: () => void;
  activeStep: PipelineStep;
  canRun: boolean;
}

export function QueryPanel({
  query,
  onQueryChange,
  onRunPipeline,
  onReset,
  activeStep,
  canRun,
}: QueryPanelProps) {
  const isRunning =
    activeStep !== 'idle' && activeStep !== 'complete';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canRun && !isRunning) {
      onRunPipeline();
    }
  };

  return (
    <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
        <Search className="w-4 h-4" />
        Query
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Enter your query to retrieve relevant context..."
          rows={3}
          disabled={isRunning}
          className="w-full px-3 py-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] resize-none disabled:opacity-50 focus:border-[hsl(var(--primary))]"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canRun || isRunning}
            className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Pipeline
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={activeStep === 'idle'}
            className="px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {!canRun && activeStep === 'idle' && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Load documents and enter a query to run the pipeline.
          </p>
        )}
      </form>
    </div>
  );
}
