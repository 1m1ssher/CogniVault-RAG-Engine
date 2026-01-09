import { VectorStore } from './rag/vector-store';
import { DeterministicLocalEmbedder } from './rag/embeddings';

let storeInstance: VectorStore | null = null;
let embedderInstance: DeterministicLocalEmbedder | null = null;

export function getVectorStore() {
    if (!storeInstance) {
        storeInstance = new VectorStore();
        try {
            storeInstance.load();
        } catch (e) {
            console.warn("Warn: Failed to load vector store", e);
        }
    }
    return storeInstance;
}

export function getEmbedder() {
    if (!embedderInstance) {
        embedderInstance = new DeterministicLocalEmbedder();
    }
    return embedderInstance;
}
