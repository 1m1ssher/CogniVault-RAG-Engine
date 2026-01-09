# CogniVault - Local RAG Knowledge Engine

## Project Overview
CogniVault is a privacy-first, local Retrieval-Augmented Generation (RAG) system engineered with Next.js and TypeScript. It implements a complete RAG pipeline from scratch—handling document ingestion, algorithmic chunking, vector embedding, and similarity search—without relying on high-level abstractions like LangChain. This project serves as a demonstration of core AI system implementation and vector search mechanics.

## Architecture & Implementation
*   **Custom RAG Pipeline**: Designed and built the end-to-end pipeline (Ingest -> Chunk -> Embed -> Index -> Retrieve) to ensure granular control over data processing and retrieval quality.
*   **Algorithmic Text Splitting**: Implemented `RecursiveCharacterTextSplitter`, a custom algorithm that preserves semantic context by intelligently breaking down documents at paragraph and sentence boundaries with efficient overlap storage.
*   **Vector Search Engine**: Built a custom in-memory vector store with persistence capabilities. It utilizes **Cosine Similarity** math to rank document chunks by semantic relevance to the user's query.
*   **Deterministic Embeddings**: Developed a deterministic frequency-based embedding model for local, offline operation, ensuring privacy and zero-latency indexing (modular design allows hot-swapping with OpenAI/HuggingFace models).
*   **Local-First Design**: The system runs entirely on the client/edge, ensuring data privacy and rapid interaction loops.

## Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Vanilla CSS (Responsive, Cyberpunk/Dark Theme)
- **Storage**: JSON-based file persistence for vector indices
- **Core Libraries**: `pdf-parse`, `uuid` (Minimal dependencies)

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/CogniVault.git
    cd CogniVault
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Navigate to `http://localhost:3000`.

## Usage
1.  **Ingest**: Upload PDF or text documents via the sidebar. The system automatically parses, chunks, and indexes the content in real-time.
2.  **Query**: Type questions into the chat interface. CogniVault retrieves the most relevant context chunks and presents them alongside the answer (simulated generation).
3.  **Inspect**: View the raw retrieved context chunks to verify the accuracy of the vector search.

## Future Roadmap
- [ ] Integration with OpenAI/Anthropic APIs for generative responses.
- [ ] Migration to a persistent vector database (e.g., Pinecone, ChromaDB).
- [ ] Graph visualization of document node relationships using D3.js.
