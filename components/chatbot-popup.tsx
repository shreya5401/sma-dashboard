'use client';

import * as React from 'react';
import { RiChat3Line, RiCloseLine, RiRobotLine, RiSendPlane2Line } from '@remixicon/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtomValue } from 'jotai';
import { keywordAtom } from '@/lib/atoms';

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showGreeting, setShowGreeting] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! I am your SMA Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const keyword = useAtomValue(keywordAtom);

  React.useEffect(() => {
    // Show greeting bubble after 3 seconds
    const timer = setTimeout(() => {
      if (!isOpen) setShowGreeting(true);
    }, 3000);

    // Hide greeting bubble after 8 seconds
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
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
            className="mb-1 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-2 shadow-regular-md"
          >
            <p className="text-paragraph-xs font-semibold text-text-strong-950">
              👋 Need help with your analytics?
            </p>
          </motion.div>
        )}

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-lg ring-1 ring-inset ring-stroke-soft-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stroke-soft-200 bg-bg-soft-200 p-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary-base">
                  <RiRobotLine className="size-4 text-white" />
                </div>
                <div>
                  <h4 className="text-label-sm font-bold text-text-strong-950">SMA Assistant</h4>
                  <div className="flex items-center gap-1">
                    <div className="size-1.5 rounded-full bg-success-base animate-pulse" />
                    <span className="text-[10px] font-medium text-text-sub-600">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 hover:bg-bg-white-0">
                <RiCloseLine className="size-5 text-text-soft-400" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-bg-soft-200/50 p-4 space-y-4"
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-paragraph-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-primary-base text-white rounded-br-none' 
                      : 'bg-bg-white-0 text-text-sub-600 rounded-bl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-bg-white-0 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                    <div className="flex gap-1">
                      <div className="size-1.5 rounded-full bg-text-soft-400 animate-bounce" />
                      <div className="size-1.5 rounded-full bg-text-soft-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="size-1.5 rounded-full bg-text-soft-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-stroke-soft-200 bg-bg-white-0 p-4">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about analytics..."
                  className="w-full rounded-xl border border-stroke-soft-200 bg-bg-soft-200 py-2.5 pl-4 pr-10 text-label-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:ring-2 focus:ring-primary-base"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-primary-base hover:bg-bg-white-0 disabled:text-text-soft-400"
                >
                  <RiSendPlane2Line className="size-5" />
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
