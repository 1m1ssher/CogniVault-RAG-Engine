import { Embedding } from './embeddings';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'vector_db.json');

export interface Document {
    id: string;
    text: string;
    metadata: Record<string, any>;
    embedding?: Embedding;
}

export interface SearchResult extends Document {
    score: number;
}

export class VectorStore {
    private documents: Document[] = [];

    constructor() { }

    addDocument(doc: Document) {
        this.documents.push(doc);
    }

    addDocuments(docs: Document[]) {
        this.documents.push(...docs);
    }

    // Cosine Similarity: (A . B) / (||A|| * ||B||)
    // Since our embeddings are normalized in the embedder, ||A|| = 1.
    // So it simplifies to Dot Product.
    similaritySearch(queryVector: Embedding, k: number = 4): SearchResult[] {
        const scores = this.documents.map(doc => {
            if (!doc.embedding) return { ...doc, score: 0 };

            const dotProduct = doc.embedding.reduce((sum, val, i) => sum + val * queryVector[i], 0);
            return {
                ...doc,
                score: dotProduct
            };
        });

        // Sort by score descending
        return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
    }

    save() {
        fs.writeFileSync(DB_PATH, JSON.stringify(this.documents, null, 2));
    }

    load() {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf-8');
            this.documents = JSON.parse(data);
        }
    }
}
