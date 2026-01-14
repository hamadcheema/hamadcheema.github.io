
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2 } from 'lucide-react';
import { gemini } from '../services/gemini';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setLoading(true);

    const newHistory: { role: 'user' | 'model', parts: { text: string }[] }[] = [
      ...chatHistory,
      { role: 'user', parts: [{ text: userMsg }] }
    ];
    setChatHistory(newHistory);

    const response = await gemini.chat(userMsg, chatHistory);
    
    setChatHistory([
      ...newHistory,
      { role: 'model', parts: [{ text: response || '' }] }
    ]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-cyan-500 p-4 rounded-full shadow-lg hover:scale-110 transition-transform neon-border group"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-12 right-0 bg-white text-black px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Talk to AI Assistant
          </span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-purple-500/30 animate-in fade-in zoom-in duration-300">
          <div className="bg-gradient-to-r from-purple-900 to-cyan-900 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-300" />
              <span className="font-bold text-sm tracking-widest uppercase">Dev Assistant AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Hi! I'm Alex's AI assistant. Ask me about his projects or request a game development quote!</p>
              </div>
            )}
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  chat.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}>
                  {chat.parts[0].text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-black/60 border-t border-gray-800 flex gap-2">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-purple-600 p-2 rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
