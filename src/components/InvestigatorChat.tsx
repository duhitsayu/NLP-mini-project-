import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, HelpCircle, AlertCircle } from 'lucide-react';

interface Message {
  sender: 'user' | 'investigator';
  text: string;
}

interface InvestigatorChatProps {
  agreementText: string;
  agreementType: string;
}

export const InvestigatorChat: React.FC<InvestigatorChatProps> = ({
  agreementText,
  agreementType,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'investigator',
      text: `Hello! I have reviewed this ${agreementType}. Ask me anything about sneaky loopholes, auto-renewals, fee increases, ownership rights, or cancellation traps in this text.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'Can they raise prices or rent without my consent?',
    'Do they own anything I create outside working hours?',
    'What happens if I try to cancel or terminate early?',
    'Are there hidden personal liability or banking access traps?',
    'Can they sue me without giving me notice or a chance to fix it?',
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: q }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-investigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementText,
          question: q,
        }),
      });

      if (!res.ok) {
        throw new Error('Investigator inquiry failed');
      }

      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          sender: 'investigator',
          text: data.answer || 'No clear clause found addressing this question.',
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          sender: 'investigator',
          text: 'Unable to complete forensic query at this moment. Please check the clause breakdown tab for direct clause audits.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-stone-900/60 rounded-xl border border-stone-800 overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-stone-200">
            Interactive Clause Investigator
          </span>
          <span className="text-stone-600 text-xs">·</span>
          <span className="text-xs text-stone-400">Grounded in verbatim text</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-500">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>NLP Reasoning Active</span>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="p-3 bg-stone-950/40 border-b border-stone-800/60 overflow-x-auto custom-scrollbar flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Quick queries:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={loading}
            className="shrink-0 text-left px-2.5 py-1 text-xs text-stone-300 hover:text-amber-300 bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700/60 rounded-md transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3.5 bg-stone-900/40">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'investigator' && (
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-amber-400" />
              </div>
            )}

            <div
              className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-stone-100'
                  : 'bg-stone-950/90 border border-stone-800 text-stone-200 shadow-md font-sans'
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-stone-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-stone-400 italic p-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Investigating agreement clauses...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-stone-950/90 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about hidden clauses, penalties, liability..."
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-3 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
