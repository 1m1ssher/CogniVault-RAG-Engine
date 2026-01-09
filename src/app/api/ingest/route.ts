import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, getEmbedder } from '@/lib/store-instance';
import { RecursiveCharacterTextSplitter } from '@/lib/rag/chunker';
import { v4 as uuidv4 } from 'uuid';
import { createRequire } from 'module';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let textCurent = '';

        if (file.type === 'application/pdf') {
            // Lazy require
            const require = createRequire(import.meta.url);
            const pdf = require('pdf-parse');
            const data = await pdf(buffer);
            textCurent = data.text;
        } else {
            // Assume text
            textCurent = buffer.toString('utf-8');
        }

        // Chunking
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });
        const chunks = splitter.splitText(textCurent);

        // Embedding & Indexing
        const embedder = getEmbedder();
        const embeddings = await embedder.embedDocuments(chunks);

        const documents = chunks.map((text, i) => ({
            id: uuidv4(),
            text,
            metadata: { source: file.name, chunkIndex: i },
            embedding: embeddings[i],
        }));

        const store = getVectorStore();
        store.addDocuments(documents);
        store.save();

        return NextResponse.json({
            success: true,
            chunks: chunks.length,
            message: `Processed ${file.name} into ${chunks.length} chunks.`
        });

    } catch (error) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: 'Failed to ingest document' }, { status: 500 });
    }
}
