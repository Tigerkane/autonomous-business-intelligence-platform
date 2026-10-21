import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  Cpu,
  HelpCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ChatMessage, LLMProvider } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Sidebar';

interface AskYourDataViewProps {
  onNavigate: (tab: NavTab) => void;
}

const SUGGESTIONS = [
  'What is the best performing product category?',
  'Which month had the highest revenue?',
  'Which age group generates the most revenue?',
  'Are there any anomalies or outliers detected in the sales data?',
  'What is the forecasted sales volume for next month?',
];

export const AskYourDataView: React.FC<AskYourDataViewProps> = ({ onNavigate }) => {
  const { loaded } = useData();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        "Hello! I am your Autonomous BI Analyst. I answer by scanning every row of your uploaded retail sales data: product categories, customer age and gender, monthly trends, totals, the sales forecast, and flagged anomalies. What would you like to explore?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      model: 'Deterministic Mathematical Solver',
      provider: 'deterministic',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('deterministic');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/llm/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.providers) {
          setProviders(data.providers);
          if (data.default) {
            setSelectedProvider(data.default);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch LLM providers:', err));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!loaded) {
    return <EmptyState onGoToUpload={() => onNavigate('upload')} />;
  }

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, provider: selectedProvider }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'AI query failed.');
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model,
        provider: data.provider,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Error analyzing query: ${err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto animate-fade-in">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-3 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Autonomous AI Data Analyst
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Natural language intelligence with full dataset telemetry context
            </p>
          </div>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Model:
          </span>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} {p.configured ? '(Ready)' : '(Offline Engine)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* What the solver can answer */}
      <p className="px-1 mb-2 text-[11px] text-slate-500 dark:text-slate-400">
        The default solver answers exact questions about categories, age and gender, customers, monthly
        trends, average order value, totals, the forecast and anomalies. For example: "Which product
        category has the lowest revenue?"
      </p>

      {/* Suggested Questions Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Suggested:
        </span>
        {SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs text-slate-600 dark:text-slate-300 transition-colors shadow-2xs disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 rounded-2xl bg-white/70 dark:bg-[#0d1527]/70 border border-slate-200/80 dark:border-white/10 shadow-inner">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-[#131d38] border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-none'
                }`}
              >
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>

                <div
                  className={`flex items-center justify-between gap-3 mt-2 text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.time}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {msg.model && (
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {msg.model}
                        </span>
                      )}
                      <button
                        onClick={() => copyText(msg.content, msg.id)}
                        className="hover:text-slate-600 dark:hover:text-white transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-[#131d38] border border-slate-200/80 dark:border-white/10 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 font-medium ml-2">
                  Evaluating retail facts with AI Analyst...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about sales revenue, trends, categories, or anomalies..."
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 shadow-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
