import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { mailAPI } from '../utils/api';
import { Mail, Send, Inbox, Trash2, Package, Coins, Diamond, X, Check, RefreshCw, ChevronLeft, AlertCircle } from 'lucide-react';

interface MailItem {
    _id: string;
    senderId: string | null;
    senderName: string;
    subject: string;
    message: string;
    attachedItems: Array<{
        itemId: string;
        name: string;
        type: string;
        rarity: string;
    }>;
    attachedGold: number;
    attachedGems: number;
    isRead: boolean;
    isCollected: boolean;
    createdAt: string;
    mailType: 'player' | 'system' | 'guild' | 'reward';
}

interface MailViewProps {
    playerState: PlayerState;
    onClose: () => void;
    onRefreshPlayer: () => void;
}

export const MailView: React.FC<MailViewProps> = ({ playerState, onClose, onRefreshPlayer }) => {
    const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
    const [mails, setMails] = useState<MailItem[]>([]);
    const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Compose state
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sendLoading, setSendLoading] = useState(false);

    useEffect(() => {
        loadInbox();
    }, []);

    const loadInbox = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await mailAPI.inbox();
            setMails(data.mails || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReadMail = async (mail: MailItem) => {
        try {
            const fullMail = await mailAPI.read(mail._id);
            setSelectedMail(fullMail);
            if (!mail.isRead) {
                setMails(prev => prev.map(m => m._id === mail._id ? { ...m, isRead: true } : m));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleCollect = async () => {
        if (!selectedMail) return;
        try {
            await mailAPI.collect(selectedMail._id);
            setSelectedMail({ ...selectedMail, isCollected: true });
            setMails(prev => prev.map(m => m._id === selectedMail._id ? { ...m, isCollected: true } : m));
            onRefreshPlayer();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (mailId: string) => {
        try {
            await mailAPI.delete(mailId);
            setMails(prev => prev.filter(m => m._id !== mailId));
            if (selectedMail?._id === mailId) setSelectedMail(null);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteAllRead = async () => {
        try {
            const result = await mailAPI.deleteAllRead();
            if (result.deletedCount > 0) {
                loadInbox();
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSend = async () => {
        if (!recipient.trim() || !subject.trim() || !message.trim()) {
            setError('Tüm alanları doldurun');
            return;
        }

        setSendLoading(true);
        setError(null);
        try {
            await mailAPI.send(recipient, subject, message);
            setRecipient('');
            setSubject('');
            setMessage('');
            setActiveTab('inbox');
            onRefreshPlayer(); // Deduct mail cost
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSendLoading(false);
        }
    };

    const getMailIcon = (mail: MailItem) => {
        if (mail.mailType === 'system') return '🔔';
        if (mail.mailType === 'reward') return '🎁';
        if (mail.mailType === 'guild') return '🏰';
        return '✉️';
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'text-orange-400';
            case 'epic': return 'text-purple-400';
            case 'rare': return 'text-blue-400';
            case 'uncommon': return 'text-green-400';
            default: return 'text-slate-300';
        }
    };

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center">
                            <Mail size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Posta Kutusu</h2>
                            <p className="text-amber-300/60 text-sm">{unreadCount} okunmamış mesaj</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700">
                    <button
                        onClick={() => { setActiveTab('inbox'); setSelectedMail(null); }}
                        className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'inbox' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Inbox size={18} /> Gelen Kutusu
                    </button>
                    <button
                        onClick={() => { setActiveTab('compose'); setSelectedMail(null); }}
                        className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'compose' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Send size={18} /> Mesaj Yaz
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/30 border-b border-red-800 p-3 flex items-center gap-2 text-red-300 text-sm">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {activeTab === 'inbox' && (
                        <>
                            {/* Mail List */}
                            <div className={`${selectedMail ? 'w-1/3' : 'w-full'} border-r border-slate-700 flex flex-col`}>
                                <div className="p-2 border-b border-slate-700 flex gap-2">
                                    <button
                                        onClick={loadInbox}
                                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Yenile"
                                    >
                                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                    </button>
                                    <button
                                        onClick={handleDeleteAllRead}
                                        className="p-2 bg-slate-800 hover:bg-red-900/50 rounded text-slate-400 hover:text-red-400 transition-colors"
                                        title="Okunanları Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {mails.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                            <Mail size={48} className="mb-2 opacity-30" />
                                            <p>Posta kutunuz boş</p>
                                        </div>
                                    ) : (
                                        mails.map(mail => (
                                            <div
                                                key={mail._id}
                                                onClick={() => handleReadMail(mail)}
                                                className={`p-3 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800/50 ${selectedMail?._id === mail._id ? 'bg-slate-800' : ''} ${!mail.isRead ? 'bg-amber-900/10' : ''}`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className="text-lg">{getMailIcon(mail)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-bold text-sm truncate ${!mail.isRead ? 'text-white' : 'text-slate-300'}`}>
                                                                {mail.subject}
                                                            </span>
                                                            {!mail.isRead && <span className="w-2 h-2 rounded-full bg-amber-500"></span>}
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate">{mail.senderName}</p>
                                                        {(mail.attachedGold > 0 || mail.attachedItems?.length > 0) && !mail.isCollected && (
                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Package size={12} className="text-green-400" />
                                                                <span className="text-[10px] text-green-400">Ek var</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Mail Detail */}
                            {selectedMail && (
                                <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                                    <button
                                        onClick={() => setSelectedMail(null)}
                                        className="md:hidden mb-4 flex items-center gap-2 text-slate-400 hover:text-white"
                                    >
                                        <ChevronLeft size={16} /> Geri
                                    </button>

                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-white mb-2">{selectedMail.subject}</h3>
                                        <p className="text-sm text-slate-400">
                                            Gönderen: <span className="text-amber-400">{selectedMail.senderName}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(selectedMail.createdAt).toLocaleString('tr-TR')}
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4 flex-1">
                                        <p className="text-slate-200 whitespace-pre-wrap">{selectedMail.message}</p>
                                    </div>

                                    {/* Attachments */}
                                    {(selectedMail.attachedGold > 0 || selectedMail.attachedGems > 0 || selectedMail.attachedItems?.length > 0) && (
                                        <div className="bg-slate-800 rounded-lg p-4 mb-4 border border-slate-700">
                                            <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                                <Package size={16} /> Ekler
                                            </h4>
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                {selectedMail.attachedGold > 0 && (
                                                    <div className="flex items-center gap-2 bg-yellow-900/30 px-3 py-2 rounded border border-yellow-700/50">
                                                        <Coins size={16} className="text-yellow-400" />
                                                        <span className="font-bold text-yellow-300">{selectedMail.attachedGold.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {selectedMail.attachedGems > 0 && (
                                                    <div className="flex items-center gap-2 bg-cyan-900/30 px-3 py-2 rounded border border-cyan-700/50">
                                                        <Diamond size={16} className="text-cyan-400" />
                                                        <span className="font-bold text-cyan-300">{selectedMail.attachedGems.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {selectedMail.attachedItems?.map((item, idx) => (
                                                    <div key={idx} className="bg-slate-700/50 px-3 py-2 rounded border border-slate-600">
                                                        <span className={`font-bold ${getRarityColor(item.rarity)}`}>{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {!selectedMail.isCollected ? (
                                                <button
                                                    onClick={handleCollect}
                                                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Check size={16} /> Ekleri Al
                                                </button>
                                            ) : (
                                                <div className="text-center text-slate-500 text-sm py-2">
                                                    ✓ Ekler alındı
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(selectedMail._id)}
                                            disabled={!selectedMail.isCollected && (selectedMail.attachedGold > 0 || selectedMail.attachedItems?.length > 0)}
                                            className="flex-1 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 size={16} /> Sil
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'compose' && (
                        <div className="flex-1 p-6 flex flex-col">
                            <div className="mb-4">
                                <label className="block text-slate-400 text-sm mb-2">Alıcı (Karakter Adı)</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="Karakter adı girin..."
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-slate-400 text-sm mb-2">Konu</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Mesaj konusu..."
                                    maxLength={100}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div className="mb-4 flex-1">
                                <label className="block text-slate-400 text-sm mb-2">Mesaj</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Mesajınızı yazın..."
                                    maxLength={1000}
                                    className="w-full h-full min-h-[200px] bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none resize-none"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <Coins size={14} className="text-yellow-400" />
                                    Gönderim ücreti: 10 Altın
                                </p>
                                <button
                                    onClick={handleSend}
                                    disabled={sendLoading || !recipient.trim() || !subject.trim() || !message.trim()}
                                    className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sendLoading ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <Send size={18} />
                                    )}
                                    Gönder
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MailView;
