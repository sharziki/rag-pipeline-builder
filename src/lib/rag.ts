export interface Document {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, string>;
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
}

export interface Embedding {
  chunkId: string;
  vector: number[];
  magnitude: number;
}

export interface RetrievalResult {
  chunk: Chunk;
  embedding: Embedding;
  similarity: number;
}

export interface PipelineConfig {
  chunkSize: number;
  chunkOverlap: number;
  embeddingDimension: number;
  topK: number;
  similarityThreshold: number;
}

export interface PipelineState {
  documents: Document[];
  chunks: Chunk[];
  embeddings: Embedding[];
  query: string;
  queryEmbedding: Embedding | null;
  retrievedChunks: RetrievalResult[];
  generatedResponse: string;
  activeStep: PipelineStep;
}

export type PipelineStep =
  | 'idle'
  | 'ingesting'
  | 'chunking'
  | 'embedding'
  | 'querying'
  | 'retrieving'
  | 'generating'
  | 'complete';

export const DEFAULT_CONFIG: PipelineConfig = {
  chunkSize: 200,
  chunkOverlap: 50,
  embeddingDimension: 8,
  topK: 3,
  similarityThreshold: 0.5,
};

// Simple tokenizer (word-based approximation)
export function estimateTokens(text: string): number {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

// Chunk document into overlapping segments
export function chunkDocument(
  document: Document,
  chunkSize: number,
  overlap: number
): Chunk[] {
  const words = document.content.split(/\s+/);
  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + chunkSize, words.length);
    const chunkWords = words.slice(startIndex, endIndex);
    const content = chunkWords.join(' ');

    chunks.push({
      id: `${document.id}-chunk-${chunkIndex}`,
      documentId: document.id,
      content,
      startIndex,
      endIndex,
      tokenCount: estimateTokens(content),
    });

    chunkIndex++;
    startIndex += chunkSize - overlap;

    if (startIndex >= words.length) break;
  }

  return chunks;
}

// Generate a deterministic pseudo-random embedding for demonstration
export function generateEmbedding(text: string, dimension: number): Embedding {
  const vector: number[] = [];
  const seed = hashCode(text.toLowerCase());

  for (let i = 0; i < dimension; i++) {
    // Deterministic pseudo-random based on text hash
    const value = Math.sin(seed * (i + 1) * 12.9898) * 43758.5453;
    vector.push(value - Math.floor(value));
  }

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  const normalizedVector = vector.map(v => v / magnitude);

  return {
    chunkId: '',
    vector: normalizedVector,
    magnitude: 1,
  };
}

// Simple hash function
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// Retrieve top-k similar chunks
export function retrieveChunks(
  queryEmbedding: Embedding,
  chunks: Chunk[],
  embeddings: Embedding[],
  topK: number,
  threshold: number
): RetrievalResult[] {
  const results: RetrievalResult[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = embeddings[i];
    const similarity = cosineSimilarity(queryEmbedding.vector, embedding.vector);

    if (similarity >= threshold) {
      results.push({
        chunk: chunks[i],
        embedding,
        similarity,
      });
    }
  }

  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Generate a mock response using retrieved context
export function generateResponse(
  query: string,
  retrievedChunks: RetrievalResult[]
): string {
  if (retrievedChunks.length === 0) {
    return "I couldn't find relevant information to answer your query.";
  }

  const contextSummary = retrievedChunks
    .map((r, i) => `[Source ${i + 1}] ${r.chunk.content.slice(0, 100)}...`)
    .join('\n');

  return `Query: "${query}"\n\nBased on ${retrievedChunks.length} retrieved sources with relevance scores of ${retrievedChunks.map(r => (r.similarity * 100).toFixed(0) + '%').join(', ')}:\n\n${contextSummary}\n\n[This is a simulated RAG response. In production, retrieved chunks would be passed to an LLM for generation.]`;
}

// Sample documents for demonstration
export const SAMPLE_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    title: 'Introduction to Machine Learning',
    content: `Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data. Unlike traditional programming where rules are explicitly coded, machine learning algorithms identify patterns in data and make decisions with minimal human intervention. The field encompasses several paradigms including supervised learning, unsupervised learning, and reinforcement learning. Supervised learning uses labeled datasets to train models that can predict outcomes, while unsupervised learning finds hidden patterns in unlabeled data. Deep learning, a subset of machine learning, uses neural networks with multiple layers to model complex patterns.`,
    metadata: { category: 'AI', author: 'Research Team' },
  },
  {
    id: 'doc-2',
    title: 'Natural Language Processing',
    content: `Natural language processing combines computational linguistics with machine learning to enable computers to understand human language. Key tasks include sentiment analysis, named entity recognition, machine translation, and question answering. Modern NLP heavily relies on transformer architectures, which use attention mechanisms to process sequential data. Large language models like GPT and BERT have revolutionized the field by achieving state-of-the-art performance on numerous benchmarks. These models are pre-trained on vast amounts of text data and can be fine-tuned for specific tasks. Embeddings represent words and sentences as dense vectors, capturing semantic relationships.`,
    metadata: { category: 'NLP', author: 'Language Lab' },
  },
  {
    id: 'doc-3',
    title: 'Vector Databases and Retrieval',
    content: `Vector databases are specialized systems designed to store and query high-dimensional vectors efficiently. They use approximate nearest neighbor algorithms like HNSW, IVF, and PQ to enable fast similarity searches. In the context of RAG systems, vector databases store document embeddings and retrieve relevant chunks based on query similarity. Popular vector databases include Pinecone, Weaviate, Milvus, and Chroma. The choice of embedding model significantly impacts retrieval quality. Hybrid search combining keyword matching with semantic similarity often yields better results than either approach alone. Chunking strategies also play a crucial role in retrieval effectiveness.`,
    metadata: { category: 'Infrastructure', author: 'Systems Team' },
  },
];
