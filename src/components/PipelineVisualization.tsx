import { useRef, useEffect } from 'react';
import type { PipelineStep } from '../lib/rag';

interface PipelineVisualizationProps {
  activeStep: PipelineStep;
  documentCount: number;
  chunkCount: number;
  embeddingCount: number;
  retrievedCount: number;
}

interface StepConfig {
  id: PipelineStep;
  label: string;
  icon: string;
  color: string;
}

const STEPS: StepConfig[] = [
  { id: 'ingesting', label: 'Ingest', icon: '📄', color: '#22c55e' },
  { id: 'chunking', label: 'Chunk', icon: '✂️', color: '#3b82f6' },
  { id: 'embedding', label: 'Embed', icon: '🔢', color: '#8b5cf6' },
  { id: 'querying', label: 'Query', icon: '🔍', color: '#f59e0b' },
  { id: 'retrieving', label: 'Retrieve', icon: '🎯', color: '#ef4444' },
  { id: 'generating', label: 'Generate', icon: '✨', color: '#06b6d4' },
];

export function PipelineVisualization({
  activeStep,
  documentCount,
  chunkCount,
  embeddingCount,
  retrievedCount,
}: PipelineVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getStepIndex = (step: PipelineStep): number => {
    if (step === 'idle') return -1;
    if (step === 'complete') return STEPS.length;
    return STEPS.findIndex(s => s.id === step);
  };

  const activeIndex = getStepIndex(activeStep);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw connections
    const stepWidth = width / STEPS.length;
    const centerY = height / 2;

    for (let i = 0; i < STEPS.length - 1; i++) {
      const startX = stepWidth * i + stepWidth / 2;
      const endX = stepWidth * (i + 1) + stepWidth / 2;

      const isActive = i < activeIndex;
      const isCurrent = i === activeIndex - 1;

      ctx.beginPath();
      ctx.moveTo(startX + 20, centerY);
      ctx.lineTo(endX - 20, centerY);
      ctx.strokeStyle = isActive ? STEPS[i].color : '#374151';
      ctx.lineWidth = isCurrent ? 3 : 2;
      ctx.stroke();

      // Animated particles for active connections
      if (isCurrent) {
        const time = Date.now() / 1000;
        const particlePos = ((time * 0.5) % 1);
        const particleX = startX + 20 + (endX - startX - 40) * particlePos;

        ctx.beginPath();
        ctx.arc(particleX, centerY, 4, 0, Math.PI * 2);
        ctx.fillStyle = STEPS[i].color;
        ctx.fill();
      }
    }
  }, [activeStep, activeIndex]);

  useEffect(() => {
    let animationId: number;

    const animate = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const stepWidth = width / STEPS.length;
      const centerY = height / 2;

      for (let i = 0; i < STEPS.length - 1; i++) {
        const startX = stepWidth * i + stepWidth / 2;
        const endX = stepWidth * (i + 1) + stepWidth / 2;

        const isActive = i < activeIndex;
        const isCurrent = i === activeIndex - 1;

        ctx.beginPath();
        ctx.moveTo(startX + 20, centerY);
        ctx.lineTo(endX - 20, centerY);
        ctx.strokeStyle = isActive ? STEPS[i].color : '#374151';
        ctx.lineWidth = isCurrent ? 3 : 2;
        ctx.stroke();

        if (isCurrent && activeStep !== 'idle' && activeStep !== 'complete') {
          const time = Date.now() / 1000;
          const particlePos = ((time * 0.5) % 1);
          const particleX = startX + 20 + (endX - startX - 40) * particlePos;

          ctx.beginPath();
          ctx.arc(particleX, centerY, 4, 0, Math.PI * 2);
          ctx.fillStyle = STEPS[i].color;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [activeStep, activeIndex]);

  const getStepCount = (step: StepConfig): number | null => {
    switch (step.id) {
      case 'ingesting':
        return documentCount;
      case 'chunking':
        return chunkCount;
      case 'embedding':
        return embeddingCount;
      case 'retrieving':
        return retrievedCount;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-4">
        RAG Pipeline
      </h2>

      <canvas
        ref={canvasRef}
        width={600}
        height={60}
        className="w-full h-[60px] mb-4"
      />

      <div className="grid grid-cols-6 gap-2">
        {STEPS.map((step, index) => {
          const isActive = index < activeIndex;
          const isCurrent = index === activeIndex;
          const count = getStepCount(step);

          return (
            <div
              key={step.id}
              className={`p-3 rounded-lg text-center transition-all ${
                isCurrent
                  ? 'bg-[hsl(var(--primary))/0.2] border-2 scale-105'
                  : isActive
                  ? 'bg-[hsl(var(--secondary))]'
                  : 'bg-[hsl(var(--background))] opacity-50'
              }`}
              style={{
                borderColor: isCurrent ? step.color : 'transparent',
              }}
            >
              <div className="text-2xl mb-1">{step.icon}</div>
              <div
                className="text-xs font-medium"
                style={{ color: isActive || isCurrent ? step.color : '#6b7280' }}
              >
                {step.label}
              </div>
              {count !== null && (isActive || isCurrent) && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  {count} items
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
