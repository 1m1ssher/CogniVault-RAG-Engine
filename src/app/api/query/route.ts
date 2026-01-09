import { NextRequest, NextResponse } from 'next/server';
import { getVectorStore, getEmbedder } from '@/lib/store-instance';

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'No query provided' }, { status: 400 });
        }

        // 1. Embed Query
        const queryEmbedding = await getEmbedder().embedQuery(query);

        // 2. Retrieve Relevant Chunks
        const results = getVectorStore().similaritySearch(queryEmbedding, 3);

        // 3. Construct Context
        const contextText = results.map(r => r.text).join('\n---\n');

        // 4. (Mock) Generate Response
        const mockResponse = `Based on your documents, I found the following information:
    
"${results[0]?.text?.substring(0, 100)}..."

(Note: This is a local RAG demo. The system successfully retrieved ${results.length} relevant context chunks. Connect an OpenAI key in 'src/lib/rag/llm.ts' to generate fluent answers.)`;

        return NextResponse.json({
            answer: mockResponse,
            sources: results.map(r => r.metadata.source),
            context: results
        });

    } catch (error) {
        console.error('Query error:', error);
        return NextResponse.json({ error: 'Failed to process query' }, { status: 500 });
    }
}
