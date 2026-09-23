import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageSquare, X, Send, Bot, User, Trash2, RefreshCw } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Tell me about Atomic Habits',
  'What books are available for ₹60 or less?',
  'What is the late fee & deposit policy?',
  'Show me top Technology & Coding books',
  'How does the waiting list work?',
  'What books do I currently have rented?'
];

const GrokAssistantWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user ? user.name : 'there'}! 👋 I am your **Rentify AI Assistant** powered by Grok.\n\nAsk me for book recommendations, questions about your active rentals, reading advice, or platform policies!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-5);
      const { data } = await axios.post('/api/ai/chat', {
        message: query,
        conversationHistory: historyPayload
      });

      if (data.success && data.reply) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.reply }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the assistant. Please try again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat history cleared. How can I assist your reading journey today?`
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl animate-pulse-glow flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
        title="Chat with Rentify AI"
      >
        <div className="relative">
          <Bot size={26} className="transition-transform group-hover:rotate-12" />
          <Sparkles size={14} className="absolute -top-1.5 -right-2 text-amber-300 animate-bounce" />
        </div>
      </button>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[92vw] sm:w-96 max-h-[580px] h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col z-50 overflow-hidden animate-fade-in">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Rentify AI Assistant
                  <span className="text-[10px] bg-blue-500/80 text-white font-medium px-2 py-0.5 rounded-full">
                    Grok
                  </span>
                </h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Platform-Aware · Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs max-w-[82%] leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></div>
                <span>Grok is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-lg whitespace-nowrap transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about books or rentals..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-md transition"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default GrokAssistantWidget;
