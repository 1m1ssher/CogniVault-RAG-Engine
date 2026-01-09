'use client';
import { useState, useRef } from 'react';
import { Upload, Send, Cpu, BrainCircuit } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  context?: any[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello. I am CogniVault. Upload your documents, and I will strictly base my answers on their content.' }
  ]);
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isQuerying, setIsQuerying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: `Success: ${data.message}` }]);
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsQuerying(true);

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
        context: data.context
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not retrieve answer.' }]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <main className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <BrainCircuit size={28} />
          <span>CogniVault</span>
        </div>

        <div className="status-panel">
          <div className="status-header">System Status</div>
          <div className="status-list">
            <div className="status-item">
              <div className="status-dot green"></div>
              Vector Database Active
            </div>
            <div className="status-item">
              <div className="status-dot blue"></div>
              Embedder Ready (Local)
            </div>
          </div>
        </div>

        <div className="upload-section">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden-input"
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="upload-btn"
          >
            {isUploading ? <div className="spinner"></div> : <Upload size={18} />}
            {isUploading ? 'Ingesting...' : 'Ingest Document'}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <section className="main-content">
        {/* Header */}
        <header className="chat-header">
          <div className="model-info">
            <Cpu size={16} />
            <span>Model: Local-RAG-v1</span>
          </div>
        </header>

        {/* Chat Stream */}
        <div className="chat-stream">
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              <div className="message-bubble">
                <div className="message-text">{msg.content}</div>
                {msg.context && (
                  <div className="context-box">
                    <p className="context-label">Retrieval Context</p>
                    <div className="context-items">
                      {msg.context.map((ctx: any, idx: number) => (
                        <div key={idx} className="context-item">
                          {ctx.text.substring(0, 150)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isQuerying && (
            <div className="message-row assistant">
              <div className="typing-indicator">
                <div className="dots">
                  <div></div><div></div><div></div>
                </div>
                <span>Thinking & Retrieving...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your documents..."
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={isQuerying || !input.trim()}
              className="send-btn"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="disclaimer">CogniVault may generate incorrect information. Check important info.</p>
        </div>
      </section>
    </main>
  );
}
