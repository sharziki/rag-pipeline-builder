import { useState, useCallback } from 'react';
import { Database } from 'lucide-react';
import { PipelineVisualization } from './components/PipelineVisualization';
import { DocumentPanel } from './components/DocumentPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { QueryPanel } from './components/QueryPanel';
import { ResultsPanel } from './components/ResultsPanel';
import {
  chunkDocument,
  generateEmbedding,
  retrieveChunks,
  generateResponse,
  SAMPLE_DOCUMENTS,
  DEFAULT_CONFIG,
} from './lib/rag';
import type {
  Document,
  Chunk,
  Embedding,
  RetrievalResult,
  PipelineConfig,
  PipelineStep,
} from './lib/rag';

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [embeddings, setEmbeddings] = useState<Embedding[]>([]);
  const [query, setQuery] = useState('');
  const [, setQueryEmbedding] = useState<Embedding | null>(null);
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievalResult[]>([]);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [activeStep, setActiveStep] = useState<PipelineStep>('idle');
  const [config, setConfig] = useState<PipelineConfig>(DEFAULT_CONFIG);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const addDocument = useCallback((doc: Document) => {
    setDocuments((prev) => [...prev, doc]);
    // Reset pipeline state when documents change
    setChunks([]);
    setEmbeddings([]);
    setRetrievedChunks([]);
    setGeneratedResponse('');
    setActiveStep('idle');
  }, []);

  const removeDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setChunks((prev) => prev.filter((c) => c.documentId !== id));
    setEmbeddings((prev) => {
      const chunkIds = chunks.filter((c) => c.documentId === id).map((c) => c.id);
      return prev.filter((e) => !chunkIds.includes(e.chunkId));
    });
    setRetrievedChunks([]);
    setGeneratedResponse('');
    setActiveStep('idle');
  }, [chunks]);

  const loadSamples = useCallback(() => {
    setDocuments(SAMPLE_DOCUMENTS);
    setChunks([]);
    setEmbeddings([]);
    setRetrievedChunks([]);
    setGeneratedResponse('');
    setActiveStep('idle');
  }, []);

  const runPipeline = useCallback(async () => {
    if (documents.length === 0 || !query.trim()) return;

    // Step 1: Ingest (documents already loaded)
    setActiveStep('ingesting');
    await sleep(500);

    // Step 2: Chunk documents
    setActiveStep('chunking');
    const allChunks: Chunk[] = [];
    for (const doc of documents) {
      const docChunks = chunkDocument(doc, config.chunkSize, config.chunkOverlap);
      allChunks.push(...docChunks);
    }
    setChunks(allChunks);
    await sleep(500);

    // Step 3: Generate embeddings
    setActiveStep('embedding');
    const allEmbeddings: Embedding[] = [];
    for (const chunk of allChunks) {
      const embedding = generateEmbedding(chunk.content, config.embeddingDimension);
      allEmbeddings.push({ ...embedding, chunkId: chunk.id });
    }
    setEmbeddings(allEmbeddings);
    await sleep(500);

    // Step 4: Process query
    setActiveStep('querying');
    const qEmbedding = generateEmbedding(query, config.embeddingDimension);
    setQueryEmbedding(qEmbedding);
    await sleep(300);

    // Step 5: Retrieve relevant chunks
    setActiveStep('retrieving');
    const retrieved = retrieveChunks(
      qEmbedding,
      allChunks,
      allEmbeddings,
      config.topK,
      config.similarityThreshold
    );
    setRetrievedChunks(retrieved);
    await sleep(500);

    // Step 6: Generate response
    setActiveStep('generating');
    const response = generateResponse(query, retrieved);
    setGeneratedResponse(response);
    await sleep(300);

    setActiveStep('complete');
  }, [documents, query, config]);

  const resetPipeline = useCallback(() => {
    setChunks([]);
    setEmbeddings([]);
    setQueryEmbedding(null);
    setRetrievedChunks([]);
    setGeneratedResponse('');
    setActiveStep('idle');
  }, []);

  const canRunPipeline = documents.length > 0 && query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center justify-center gap-3">
            <Database className="w-8 h-8 text-[hsl(var(--primary))]" />
            RAG Pipeline Builder
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Visualize and experiment with Retrieval-Augmented Generation
          </p>
        </div>

        {/* Pipeline Visualization */}
        <div className="mb-6">
          <PipelineVisualization
            activeStep={activeStep}
            documentCount={documents.length}
            chunkCount={chunks.length}
            embeddingCount={embeddings.length}
            retrievedCount={retrievedChunks.length}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Documents & Config */}
          <div className="space-y-4">
            <DocumentPanel
              documents={documents}
              chunks={chunks}
              embeddings={embeddings}
              onAddDocument={addDocument}
              onRemoveDocument={removeDocument}
              onLoadSamples={loadSamples}
            />
            <ConfigPanel config={config} onConfigChange={setConfig} />
          </div>

          {/* Middle Column: Query */}
          <div className="space-y-4">
            <QueryPanel
              query={query}
              onQueryChange={setQuery}
              onRunPipeline={runPipeline}
              onReset={resetPipeline}
              activeStep={activeStep}
              canRun={canRunPipeline}
            />

            {/* Stats */}
            <div className="p-4 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
              <h2 className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">
                Pipeline Stats
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Documents
                  </div>
                  <div className="text-lg font-bold text-[#22c55e]">
                    {documents.length}
                  </div>
                </div>
                <div className="p-2 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Chunks
                  </div>
                  <div className="text-lg font-bold text-[#3b82f6]">
                    {chunks.length}
                  </div>
                </div>
                <div className="p-2 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Embeddings
                  </div>
                  <div className="text-lg font-bold text-[#8b5cf6]">
                    {embeddings.length}
                  </div>
                </div>
                <div className="p-2 bg-[hsl(var(--secondary))] rounded-lg">
                  <div className="text-xs text-[hsl(var(--muted-foreground))]">
                    Retrieved
                  </div>
                  <div className="text-lg font-bold text-[#ef4444]">
                    {retrievedChunks.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div>
            <ResultsPanel
              retrievedChunks={retrievedChunks}
              generatedResponse={generatedResponse}
            />
          </div>
        </div>

        <p className="text-center text-xs text-[hsl(var(--muted-foreground))] mt-6">
          Educational RAG pipeline demonstration. Uses simplified embeddings for visualization.
        </p>
      </div>
    </div>
  );
}

export default App;
