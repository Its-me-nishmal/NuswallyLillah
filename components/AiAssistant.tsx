
import React, { useState, useRef, useEffect } from 'react';
import { generateIslamicGuidance } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, Loader2, Info } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'As-salamu alaykum! I am Nuswally Bot. How can I assist you with your journey today? I can help with finding verses, prayer times explanation, or general Islamic guidance.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateIslamicGuidance(input);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I apologize, but I am having trouble connecting at the moment. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in duration-500">

      {/* Header */}
      <div className="bg-emerald-600 p-4 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold">Nuswally Bot</h2>
            <p className="text-xs text-emerald-100">Powered by AI • Always Verify with Scholars</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3 flex gap-3 text-sm text-amber-800 dark:text-amber-400 mb-4">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>This is an AI assistant. While trained on Islamic texts, errors can occur. For legal rulings (Fatwa), please consult a qualified scholar.</p>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                  : msg.isError
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-bl-none'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-bl-none'
                }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {/* Simple rendering for markdown-like structure */}
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('-') || line.startsWith('*') ? 'ml-4' : ''}>
                    {line}
                  </p>
                ))}
              </div>
              <span className={`text-[10px] mt-2 block opacity-70 ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Reflecting...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a verse, prayer, or topic..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
