export type Embedding = number[];

export interface EmbeddingProvider {
    embedQuery(text: string): Promise<Embedding>;
    embedDocuments(texts: string[]): Promise<Embedding[]>;
}

// A simple local embedding offering for valid resume demonstration without API keys.
// Uses a simple hashing/frequency vectorizer to map text to a fixed dimension space.
export class DeterministicLocalEmbedder implements EmbeddingProvider {
    private dimensions: number;

    constructor(dimensions = 1536) { // Matching OpenAI's dimension for realism
        this.dimensions = dimensions;
    }

    // Simple hashing function to map string tokens to vector indices
    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    async embedQuery(text: string): Promise<Embedding> {
        return this.embed(text);
    }

    async embedDocuments(texts: string[]): Promise<Embedding[]> {
        return texts.map(t => this.embed(t));
    }

    // Creates a sparse-like dense vector based on token content
    private embed(text: string): Embedding {
        const vector = new Array(this.dimensions).fill(0);
        const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 2);

        for (const token of tokens) {
            const hash = this.hashString(token);
            const index = hash % this.dimensions;
            // Increment magnitude at this dimension (frequency)
            vector[index] += 1;
        }

        // Normalize
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map(val => (magnitude === 0 ? 0 : val / magnitude));
    }
}

export class OpenAIEmbedder implements EmbeddingProvider {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async embedQuery(text: string): Promise<Embedding> {
        // Placeholder for actual API call
        console.log("Calling OpenAI with", text.slice(0, 20));
        // Simulate latency
        await new Promise(r => setTimeout(r, 500));
        return new Array(1536).fill(0).map(() => Math.random());
    }

    async embedDocuments(texts: string[]): Promise<Embedding[]> {
        return Promise.all(texts.map(t => this.embedQuery(t)));
    }
}
