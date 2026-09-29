import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  RefreshCw, 
  MessageSquare, 
  X, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  Bot,
  ChevronDown
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Is Curcumin + Piperine patentable under Section 3(p)?",
  "When is NBA Form 1 approval mandatory for AYUSH exports?",
  "How does TKDL prior art citation affect PCT timelines?",
  "What synergistic efficacy data overcomes Section 3(d)?"
];

export default function ConsultationChat({ onOpenVoiceModal, voiceTranscript, clearVoiceTranscript }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Namaste! I am the Vedha Mind Statutory Consultation Assistant. Ask me any question regarding patent eligibility, Section 3(p) TKDL bars, National Biodiversity Authority (NBA) approvals, or international PCT timelines.'
    }
  ]);
  const [query, setQuery] = useState('');
  const [jurisdiction, setJurisdiction] = useState('india');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (voiceTranscript) {
      setQuery(voiceTranscript);
      clearVoiceTranscript();
      setIsOpen(true);
    }
  }, [voiceTranscript]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (customText = null) => {
    const userText = (typeof customText === 'string' ? customText : query).trim();
    if (!userText || loading) return;

    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText, jur: jurisdiction }]);
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userText,
          jurisdiction,
          context_str: "",
          chunks: [],
          history: messages.slice(-4)
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || 'Consultation processed.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: `Connection error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'ai',
        text: 'Namaste! I am the Vedha Mind Statutory Consultation Assistant. Ask me any question regarding patent eligibility, Section 3(p) TKDL bars, National Biodiversity Authority (NBA) approvals, or international PCT timelines.'
      }
    ]);
  };

  const renderBubbleText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
      const content = isBullet ? trimmed.replace(/^[-*•]\s+/, '') : line;
      const parts = content.split(/(\*\*.*?\*\*)/g);

      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="bubble-bullet-row">
            <span className="bullet-dot">•</span>
            <span>{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="bubble-line">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="chat-overlay-wrapper">
      {/* Floating Chat Overlay Window */}
      {isOpen && (
        <div 
          className="chat-overlay-window" 
          role="dialog" 
          aria-label="Vedha Mind IP Consultation Chat"
        >
          {/* Header */}
          <div className="chat-overlay-header">
            <div className="chat-header-info">
              <div className="chat-header-avatar">
                <Bot size={19} />
              </div>
              <div className="chat-header-text">
                <div className="chat-header-title">IP Consultation Chat</div>
                <div className="chat-header-subtitle">
                </div>
              </div>
            </div>

            <div className="chat-header-actions">
              <button 
                className="chat-header-btn" 
                onClick={handleResetChat} 
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={15} />
              </button>
              <button 
                className="chat-header-btn" 
                onClick={() => setIsOpen(false)} 
                title="Minimize chat"
                aria-label="Minimize chat"
              >
                <ChevronDown size={18} />
              </button>
              <button 
                className="chat-header-btn close" 
                onClick={() => setIsOpen(false)} 
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="chat-messages-scroll">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble-row ${m.role}`}>
                <div className="chat-bubble">
                  {m.jur && (
                    <div className="bubble-jur-tag">
                      <span className="jur-badge">{m.jur.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="bubble-content">
                    {renderBubbleText(m.text)}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row ai">
                <div className="chat-bubble thinking">
                  <RefreshCw size={15} className="spinner-icon" /> Consulting statutory acts & TKDL records...
                </div>
              </div>
            )}

            {/* Quick Suggested Prompts (shown when only initial message exists) */}
            {messages.length === 1 && !loading && (
              <div className="suggested-prompts-container">
                <div className="suggested-prompts-label">
                   Dry Run Queries
                </div>
                <div className="suggested-prompts-grid">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button 
                      key={i} 
                      className="suggested-prompt-chip"
                      onClick={() => handleSend(prompt)}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="chat-input-bar">
            <div className="input-row-top">
              <div className="jur-choice">
                <span>Jurisdiction:</span>
                <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
                  <option value="india">India (IPO / TKDL / NBA)</option>
                  <option value="international">International (PCT / EPO / USPTO)</option>
                  <option value="both">Both (Harmonized)</option>
                </select>
              </div>
              <button 
                className="voice-input-chip"
                onClick={() => onOpenVoiceModal('chat')}
                title="Speak question in your Indian language"
                type="button"
              >
                <Mic size={13} /> Voice Input (Indian Lang)
              </button>
            </div>

            <div className="input-box-wrapper">
              <textarea 
                rows="2"
                placeholder="Ask about TKDL, Section 3(p), NBA approval, or PCT..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button 
                className="send-btn" 
                onClick={() => handleSend()} 
                disabled={loading || !query.trim()}
                title="Send query (Enter)"
                aria-label="Send query"
                type="button"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Overlay Trigger Button */}
      <button 
        className={`chat-overlay-trigger-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close IP Consultation Chat" : "Open IP Consultation Chat"}
        title={isOpen ? "Close Consultation Chat" : "Open IP Consultation Chat"}
        type="button"
      >
        <div className="fab-icon-inner">
          {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
        </div>
        {!isOpen && (
          <span className="fab-pill-label">
            <span>IP Chat</span>
          </span>
        )}
      </button>
    </div>
  );
}
