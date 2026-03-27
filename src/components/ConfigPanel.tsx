import { Settings } from 'lucide-react';
import type { PipelineConfig } from '../lib/rag';

interface ConfigPanelProps {
  config: PipelineConfig;
  onConfigChange: (config: PipelineConfig) => void;
}

export function ConfigPanel({ config, onConfigChange }: ConfigPanelProps) {
  const handleChange = (key: keyof PipelineConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  return (
    <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
        <Settings className="w-4 h-4" />
        Pipeline Configuration
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Chunk Size</span>
            <span className="text-[hsl(var(--foreground))]">{config.chunkSize} words</span>
          </div>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={config.chunkSize}
            onChange={(e) => handleChange('chunkSize', parseInt(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Chunk Overlap</span>
            <span className="text-[hsl(var(--foreground))]">{config.chunkOverlap} words</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={config.chunkOverlap}
            onChange={(e) => handleChange('chunkOverlap', parseInt(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Embedding Dimension</span>
            <span className="text-[hsl(var(--foreground))]">{config.embeddingDimension}D</span>
          </div>
          <input
            type="range"
            min={4}
            max={32}
            step={4}
            value={config.embeddingDimension}
            onChange={(e) => handleChange('embeddingDimension', parseInt(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#8b5cf6]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Top-K Results</span>
            <span className="text-[hsl(var(--foreground))]">{config.topK}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={config.topK}
            onChange={(e) => handleChange('topK', parseInt(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ef4444]"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[hsl(var(--muted-foreground))]">Similarity Threshold</span>
            <span className="text-[hsl(var(--foreground))]">{(config.similarityThreshold * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.similarityThreshold}
            onChange={(e) => handleChange('similarityThreshold', parseFloat(e.target.value))}
            className="w-full h-2 bg-[hsl(var(--secondary))] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#ef4444]"
          />
        </div>
      </div>
    </div>
  );
}
