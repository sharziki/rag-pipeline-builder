# RAG Pipeline Builder

Interactive visualization of a Retrieval-Augmented Generation (RAG) pipeline. Experiment with document ingestion, chunking, embedding, and retrieval in real-time.

## Features

- **Pipeline Visualization**: Animated step-by-step view of the RAG process
- **Document Management**: Add, remove, and load sample documents
- **Configurable Chunking**: Adjust chunk size and overlap parameters
- **Embedding Generation**: Simplified vector embeddings for demonstration
- **Similarity Search**: Top-K retrieval with configurable threshold
- **2D Embedding Projection**: Visualize query and chunk vectors in 2D space

## Pipeline Steps

1. **Ingest**: Load documents into the system
2. **Chunk**: Split documents into overlapping segments
3. **Embed**: Generate vector embeddings for each chunk
4. **Query**: Process user query into an embedding
5. **Retrieve**: Find most similar chunks via cosine similarity
6. **Generate**: Combine retrieved context for response

## Configuration Options

| Parameter | Description | Range |
|-----------|-------------|-------|
| Chunk Size | Words per chunk | 50-500 |
| Chunk Overlap | Overlapping words | 0-100 |
| Embedding Dimension | Vector size | 4-32 |
| Top-K Results | Chunks to retrieve | 1-10 |
| Similarity Threshold | Minimum relevance | 0-100% |

## Sample Documents

Includes pre-loaded documents on:
- Machine Learning fundamentals
- Natural Language Processing
- Vector Databases and Retrieval

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide React icons
- Canvas API for visualization

## Getting Started

```bash
npm install
npm run dev
```

## Key Algorithms

### Chunking
```typescript
// Overlapping sliding window
while (startIndex < words.length) {
  chunks.push(words.slice(startIndex, startIndex + chunkSize));
  startIndex += chunkSize - overlap;
}
```

### Cosine Similarity
```typescript
similarity = dotProduct(a, b) / (magnitude(a) * magnitude(b))
```

### Retrieval
```typescript
results = chunks
  .filter(c => similarity(query, c) >= threshold)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, topK)
```

## Notes

- Uses simplified deterministic embeddings for educational purposes
- Real RAG systems use transformer-based embedding models
- Production systems integrate with vector databases (Pinecone, Weaviate, etc.)

## License

MIT
