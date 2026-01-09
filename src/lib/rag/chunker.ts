export interface Chunk {
    id: string;
    text: string;
    metadata: Record<string, any>;
}

export class RecursiveCharacterTextSplitter {
    private chunkSize: number;
    private chunkOverlap: number;
    private separators: string[];

    constructor({
        chunkSize = 1000,
        chunkOverlap = 200,
        separators = ["\n\n", "\n", " ", ""],
    } = {}) {
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.separators = separators;
    }

    splitText(text: string): string[] {
        const finalChunks: string[] = [];
        let separator = this.separators[this.separators.length - 1];

        // Find the best separator
        for (const s of this.separators) {
            if (s === "") {
                separator = s;
                break;
            }
            if (text.includes(s)) {
                separator = s;
                break;
            }
        }

        // Split using the separator
        const splits = separator ? text.split(separator) : text.split("");
        let currentChunk: string[] = [];
        let currentLength = 0;

        for (const split of splits) {
            const splitLen = split.length;

            if (currentLength + splitLen + (currentChunk.length > 0 ? separator.length : 0) > this.chunkSize) {
                if (currentChunk.length > 0) {
                    const chunkStr = currentChunk.join(separator);
                    finalChunks.push(chunkStr);

                    // Handle overlap
                    // Keep the last few items that fit within overlap
                    // Simpler approach: clear and start new, but for proper RAG we want overlap.
                    // This creates a sliding window effect
                    while (
                        currentChunk.length > 0 &&
                        this.length(currentChunk.join(separator)) > this.chunkOverlap
                    ) {
                        currentChunk.shift();
                    }
                }
            }
            currentChunk.push(split);
            currentLength = this.length(currentChunk.join(separator));
        }

        if (currentChunk.length > 0) {
            finalChunks.push(currentChunk.join(separator));
        }

        return finalChunks;
    }

    private length(text: string): number {
        return text.length;
    }
}
