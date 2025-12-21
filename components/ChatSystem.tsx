import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, PlayerState } from '../types';
import { Send, Hash, Users, Crown, Shield, Globe, MessageSquare } from 'lucide-react';
import { soundManager } from './SoundManager';

interface ChatSystemProps {
    playerState?: PlayerState;
    messages: ChatMessage[];
    onSendMessage: (text: string, channel: 'global' | 'party' | 'guild') => void;
    className?: string; // Allow external positioning/sizing
}

const ChatSystem: React.FC<ChatSystemProps> = ({ playerState, messages, onSendMessage, className }) => {
    const [activeChannel, setActiveChannel] = useState<'global' | 'party' | 'guild'>('global');
    const [inputText, setInputText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeChannel]);

    // Filter messages based on channel
    const filteredMessages = messages.filter(msg => {
        // System messages are global
        if (msg.type === 'system') return true;
        // Channel filtering
        return msg.type === activeChannel;
    });

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        onSendMessage(inputText, activeChannel);
        setInputText('');
        soundManager.playSFX('click');
    };

    return (
        <div className={`flex flex-col flex-1 bg-black/60 backdrop-blur-md border border-slate-700/50 rounded-lg overflow-hidden shadow-xl transition-all ${isFocused ? 'bg-black/80 border-yellow-600/50' : ''} ${className}`}>
            {/* Header / Tabs */}
            <div className="flex bg-slate-900/90 border-b border-slate-800 shrink-0">
                <button
                    onClick={() => { setActiveChannel('global'); soundManager.playSFX('click'); }}
                    className={`flex-1 p-2 text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeChannel === 'global' ? 'text-white bg-slate-800 border-b-2 border-slate-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Globe size={12} /> <span className="hidden md:inline">GENEL</span>
                </button>
                <button
                    onClick={() => { setActiveChannel('party'); soundManager.playSFX('click'); }}
                    className={`flex-1 p-2 text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeChannel === 'party' ? 'text-blue-400 bg-blue-900/20 border-b-2 border-blue-500' : 'text-slate-500 hover:text-blue-400'}`}
                >
                    <Users size={12} /> <span className="hidden md:inline">PARTİ</span>
                </button>
                <button
                    onClick={() => { setActiveChannel('guild'); soundManager.playSFX('click'); }}
                    className={`flex-1 p-2 text-[10px] md:text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeChannel === 'guild' ? 'text-yellow-400 bg-yellow-900/20 border-b-2 border-yellow-500' : 'text-slate-500 hover:text-yellow-400'}`}
                >
                    <Shield size={12} /> <span className="hidden md:inline">KLAN</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
                {filteredMessages.length === 0 && (
                    <div className="text-slate-600 text-[10px] text-center mt-4 italic opacity-50">Sohbet kanalı boş...</div>
                )}
                {filteredMessages.map((msg) => (
                    <div key={msg.id} className="text-[10px] md:text-xs break-words font-medium animate-in fade-in slide-in-from-bottom-1 duration-200 leading-tight">
                        {msg.type === 'system' && (
                            <span className="text-yellow-500 italic drop-shadow-sm">
                                <span className="opacity-70">[SİSTEM]</span> {msg.text}
                            </span>
                        )}
                        {msg.type === 'global' && (
                            <span className="text-slate-200">
                                <span className="text-slate-400 font-bold drop-shadow-md">[{msg.sender}]:</span> {msg.text}
                            </span>
                        )}
                        {msg.type === 'party' && (
                            <span className="text-blue-300">
                                <span className="text-blue-500 font-bold drop-shadow-md">[Parti] {msg.sender}:</span> {msg.text}
                            </span>
                        )}
                        {msg.type === 'guild' && (
                            <span className="text-yellow-200">
                                <span className="text-yellow-500 font-bold drop-shadow-md">[Klan] {msg.sender}:</span> {msg.text}
                            </span>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-1 md:p-2 bg-slate-900 border-t border-slate-800 flex gap-2 shrink-0">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={`${activeChannel === 'global' ? 'Genel' : activeChannel === 'party' ? 'Parti' : 'Klan'} kanalına yaz...`}
                    className="flex-1 bg-black/50 border border-slate-700 rounded px-2 py-1 text-[10px] md:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-yellow-600 focus:ring-1 focus:ring-yellow-600 transition-all"
                    maxLength={150}
                />
                <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-slate-700 hover:bg-yellow-600 disabled:opacity-50 text-white p-1 rounded transition-colors flex items-center justify-center aspect-square h-full"
                >
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
};

export default ChatSystem;
