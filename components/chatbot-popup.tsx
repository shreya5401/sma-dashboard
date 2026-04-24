'use client';

import ReactMarkdown from 'react-markdown';

import * as React from 'react';
import { RiChat3Line, RiCloseLine, RiRobotLine, RiSendPlane2Line, RiExpandDiagonalLine, RiCollapseDiagonalLine } from '@remixicon/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { keywordAtom } from '@/lib/atoms';

const QUICK_SUGGESTIONS = [
  "How does this dashboard work?",
  "Analyze Module 11 (Competitors)",
  "What is ROI in Module 8?",
  "Tell me about Fake News Detection",
  "Who are the top influencers?",
  "Which brands can I search for?",
  "I want to ask something else..."
];

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showGreeting, setShowGreeting] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! I am your SMA Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const keyword = useAtomValue(keywordAtom);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowGreeting(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 11000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (messageText: string) => {
    const userMsg = messageText.trim();
    if (!userMsg || isTyping) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    setShowGreeting(false);

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: { keyword } }),
      });
      const data = await res.json();
      
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', text: data.response }]);
        setIsTyping(false);
      }, 600);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting right now.' }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="mb-1 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-5 py-3 shadow-regular-md"
          >
            <p className="text-label-sm font-semibold text-text-strong-950">
              👋 Need help with your analytics?
            </p>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? '600px' : '400px',
              height: isExpanded ? '800px' : '600px',
              maxHeight: 'calc(100vh - 100px)'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="flex flex-col overflow-hidden rounded-3xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xl ring-1 ring-inset ring-stroke-soft-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke-soft-200 bg-bg-soft-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary-base">
                  <RiRobotLine className="size-5 text-white" />
                </div>
                <div>
                  <h4 className="text-label-md font-bold text-text-strong-950">SMA Assistant</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-success-base animate-pulse" />
                    <span className="text-xs font-medium text-text-sub-600">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="rounded-xl p-2 hover:bg-bg-white-0 transition-colors"
                  title={isExpanded ? "Shrink" : "Expand"}
                >
                  {isExpanded ? (
                    <RiCollapseDiagonalLine className="size-5 text-text-soft-400" />
                  ) : (
                    <RiExpandDiagonalLine className="size-5 text-text-soft-400" />
                  )}
                </button>
                <button onClick={() => setIsOpen(false)} className="rounded-xl p-2 hover:bg-bg-white-0 transition-colors">
                  <RiCloseLine className="size-6 text-text-soft-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-bg-soft-200/50 p-6 space-y-5"
            >
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[90%] rounded-2xl px-5 py-3 text-label-md leading-relaxed shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-primary-base text-white rounded-br-none' 
                      : 'bg-bg-white-0 text-text-strong-950 rounded-bl-none prose prose-sm prose-slate max-w-none'
                  }`}>
                    {m.role === 'bot' ? (
                      <ReactMarkdown 
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-title-h6 font-bold mb-2 mt-1" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-label-md font-bold mb-1.5 mt-3" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 mb-2" {...props} />,
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    ) : m.text}
                  </div>
                </motion.div>
              ))}

              {/* Suggestions Chips */}
              {messages.length === 1 && !isTyping && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      onClick={() => handleSend(s)}
                      className="rounded-full border border-primary-soft-200 bg-primary-soft-100 px-4 py-2 text-xs font-medium text-primary-base hover:bg-primary-base hover:text-white transition-all"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-white-0 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="size-2 rounded-full bg-text-soft-400 animate-bounce" />
                      <div className="size-2 rounded-full bg-text-soft-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="size-2 rounded-full bg-text-soft-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
              className="border-t border-stroke-soft-200 bg-bg-white-0 p-6"
            >
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about analytics..."
                  className="w-full rounded-2xl border border-stroke-soft-200 bg-bg-soft-200 py-3.5 pl-5 pr-12 text-label-md text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base transition-all"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-primary-base hover:bg-bg-white-0 disabled:text-text-soft-400 transition-colors"
                >
                  <RiSendPlane2Line className="size-6" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-14 items-center justify-center rounded-full bg-primary-base text-white shadow-regular-lg"
      >
        {!isOpen && (
          <span className="absolute inset-0 inline-flex h-full w-full animate-ping rounded-full bg-primary-base opacity-40" />
        )}
        <RiChat3Line className="size-6" />
      </motion.button>
    </div>
  );
}
