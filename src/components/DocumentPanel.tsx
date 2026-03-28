import { useState } from 'react';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import type { Document, Chunk, Embedding } from '../lib/rag';

interface DocumentPanelProps {
  documents: Document[];
  chunks: Chunk[];
  embeddings: Embedding[];
  onAddDocument: (doc: Document) => void;
  onRemoveDocument: (id: string) => void;
  onLoadSamples: () => void;
}

export function DocumentPanel({
  documents,
  chunks,
  embeddings,
  onAddDocument,
  onRemoveDocument,
  onLoadSamples,
}: DocumentPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    if (newTitle.trim() && newContent.trim()) {
      onAddDocument({
        id: `doc-${Date.now()}`,
        title: newTitle.trim(),
        content: newContent.trim(),
      });
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
    }
  };

  const getDocumentChunks = (docId: string) => {
    return chunks.filter(c => c.documentId === docId);
  };

  return (
    <div className="p-5 md:p-6 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[hsl(var(--foreground))] flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documents ({documents.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onLoadSamples}
            className="px-2 py-1 text-xs bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            Load Samples
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="px-2 py-1 text-xs bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-4 p-3 bg-[hsl(var(--secondary))] rounded-lg space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Document title..."
            className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Document content..."
            rows={4}
            className="w-full px-3 py-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim() || !newContent.trim()}
              className="px-3 py-1 text-xs bg-[hsl(var(--primary))] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Add Document
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-[hsl(var(--muted-foreground))] text-sm">
            No documents loaded. Add documents or load samples to begin.
          </div>
        ) : (
          documents.map((doc) => {
            const docChunks = getDocumentChunks(doc.id);
            const docEmbeddings = embeddings.filter(e =>
              docChunks.some(c => c.id === e.chunkId)
            );

            return (
              <div
                key={doc.id}
                className="p-3 bg-[hsl(var(--secondary))] rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">
                      {doc.content.slice(0, 150)}...
                    </p>
                    <div className="flex gap-3 mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>{doc.content.split(/\s+/).length} words</span>
                      {docChunks.length > 0 && (
                        <span className="text-[#3b82f6]">
                          {docChunks.length} chunks
                        </span>
                      )}
                      {docEmbeddings.length > 0 && (
                        <span className="text-[#8b5cf6]">
                          {docEmbeddings.length} embeddings
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveDocument(doc.id)}
                    className="p-1 text-[hsl(var(--muted-foreground))] hover:text-[#ef4444] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
