'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations('Chatbot');

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] rounded-[2rem] bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-fade-in-up glass-panel">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white leading-tight">Epi'AI Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-[10px] text-emerald-400/80 font-medium uppercase tracking-wider">Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-hide">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-200 self-start max-w-[85%] leading-relaxed">
                            Hello! I am the Epi'AI virtual assistant. How can I help you regarding our programs in Math, AI or Data Science?
                        </div>
                        <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 text-xs text-blue-100 self-end ml-auto max-w-[85%] leading-relaxed">
                            Tell me more about the technical pole projects.
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-gray-200 self-start max-w-[85%] leading-relaxed">
                            Our technical pole works on real-world applications like Traffic Sign Recognition using CNNs, and NLP-based campus assistants. We use Python, PyTorch, and React.
                        </div>
                    </div>

                    {/* Input Field */}
                    <div className="p-4 bg-white/5 border-t border-white/10">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors pr-12"
                            />
                            <button className="absolute right-2 top-1.5 p-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all duration-300 shadow-2xl group ${isOpen
                        ? 'bg-slate-800 border-white/20 rotate-90 scale-90'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 border-white/10 hover:scale-110 active:scale-95'
                    }`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-6 h-6 text-white group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 group-hover:scale-125 transition-transform"></div>
                    </div>
                )}
            </button>
        </div>
    );
}
