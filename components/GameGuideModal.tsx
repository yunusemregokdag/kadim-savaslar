import React, { useState } from 'react';
import { X, Book, Trophy, Info, Keyboard, Move, Target, MessageSquare, Settings, Zap } from 'lucide-react';
import { RANKS } from '../constants';

interface GameGuideModalProps {
    onClose: () => void;
}

export const GameGuideModal: React.FC<GameGuideModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'level' | 'rank' | 'controls'>('level');
    const [controlMode, setControlMode] = useState<'pc' | 'mobile'>('pc');

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-[fadeIn_0.2s]">
            <div className="bg-[#1a120b] border-2 border-[#5e4b35] rounded-xl w-full max-w-5xl max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-4 border-b border-[#5e4b35] bg-[#2a1d12] flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-[#e6cba5] flex items-center gap-3">
                            <Book className="text-yellow-500" /> OYUN REHBERİ
                        </h2>
                        {/* TABS */}
                        <div className="flex gap-2 ml-8">
                            <button
                                onClick={() => setActiveTab('level')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === 'level' ? 'bg-yellow-600 text-white shadow-[0_0_10px_#ca8a04]' : 'bg-[#3f2e18] text-slate-400 hover:bg-[#5e4b35]'}`}
                            >
                                Seviye Sistemi
                            </button>
                            <button
                                onClick={() => setActiveTab('rank')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'rank' ? 'bg-blue-600 text-white shadow-[0_0_10px_#2563eb]' : 'bg-[#3f2e18] text-slate-400 hover:bg-[#5e4b35]'}`}
                            >
                                <Trophy size={16} /> Rütbe Sistemi
                            </button>
                            <button
                                onClick={() => setActiveTab('controls')}
                                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'controls' ? 'bg-purple-600 text-white shadow-[0_0_10px_#9333ea]' : 'bg-[#3f2e18] text-slate-400 hover:bg-[#5e4b35]'}`}
                            >
                                <Keyboard size={16} /> Kontroller
                            </button>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-red-900/50 hover:bg-red-700 text-red-200 p-2 rounded-lg transition-colors border border-red-800">
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 text-slate-300 custom-scrollbar bg-[url('/ui/parchment_bg.png')] bg-cover bg-blend-overlay bg-[#1a120b]/90">

                    {activeTab === 'level' && (
                        <div className="animate-[fadeIn_0.3s]">
                            {/* Level Progression Table */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-yellow-500 mb-4 border-b border-yellow-500/30 pb-2">Seviye ve Harita Gelişimi</h3>

                                {/* NPC Access Note */}
                                <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-amber-200 text-sm">
                                    <strong>⚠️ ÖNEMLİ:</strong> Demirci ve Market NPC'leri sadece <strong>X-1 (Ana Merkez)</strong> ve <strong>X-8 (Boss Haritası)</strong> haritalarında aktiftir. Diğer haritalarda bu NPC'ler <span className="text-red-400">İNAKTİF</span> olacaktır.
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-[#5e4b35] shadow-lg">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#2a1d12] text-[#e6cba5]">
                                            <tr>
                                                <th className="p-3 border-b border-[#5e4b35]">Seviye</th>
                                                <th className="p-3 border-b border-[#5e4b35]">Gerekli XP</th>
                                                <th className="p-3 border-b border-[#5e4b35]">Erişim & Özellikler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#5e4b35]/50 bg-[#1a1005]">
                                            <tr className="bg-green-900/10"><td className="p-3 font-bold text-green-400">01</td><td className="p-3 text-white">0</td><td className="p-3 text-slate-300">X-1 ve X-2 Haritalarına Erişim (Kendi Birliğin)</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">02</td><td className="p-3 text-white">10.000</td><td className="p-3 text-slate-300">X-3 ve X-4 Haritalarına Erişim</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">03</td><td className="p-3 text-white">20.000</td><td className="p-3 text-slate-300">X-3'ten X-4'e Direkt Geçiş Portalı</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">04</td><td className="p-3 text-white">40.000</td><td className="p-3 text-slate-300">-</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">05</td><td className="p-3 text-white">80.000</td><td className="p-3 text-slate-300">Düşman Birlik X-3/X-4 Haritalarına Sızma</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">06</td><td className="p-3 text-white">160.000</td><td className="p-3 text-slate-300">Düşman X-3'ten X-4'e Geçiş</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">07</td><td className="p-3 text-white">320.000</td><td className="p-3 text-slate-300">-</td></tr>
                                            <tr className="bg-red-900/10"><td className="p-3 font-bold text-red-400">08</td><td className="p-3 text-white">640.000</td><td className="p-3 text-red-300 font-bold">PvP BÖLGESİ (4-1, 4-2, 4-3) Erişimi</td></tr>
                                            <tr className="bg-red-900/20"><td className="p-3 font-bold text-red-500">09</td><td className="p-3 text-white">1.280.000</td><td className="p-3 text-red-400 font-black">4-4 ARENA (Merkez Savaş) Erişimi</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">10</td><td className="p-3 text-white">2.560.000</td><td className="p-3 text-slate-300">X-5 Elit Harita (Kendi Birliğin)</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">11</td><td className="p-3 text-white">5.120.000</td><td className="p-3 text-slate-300">X-6 ve X-7 Haritaları (Kendi Birliğin)</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">12</td><td className="p-3 text-white">10.240.000</td><td className="p-3 text-slate-300">X-8 Boss Haritası (Kendi Birliğin)</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">13</td><td className="p-3 text-white">20.480.000</td><td className="p-3 text-slate-300">Düşman X-2 Haritasına Erişim</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">14</td><td className="p-3 text-white">40.960.000</td><td className="p-3 text-slate-300">Düşman X-5 Haritasına Erişim</td></tr>
                                            <tr><td className="p-3 font-bold text-slate-400">15</td><td className="p-3 text-white">81.920.000</td><td className="p-3 text-slate-300">Düşman X-6 ve X-7 Haritalarına Erişim</td></tr>
                                            <tr className="bg-purple-900/20"><td className="p-3 font-bold text-purple-400">16</td><td className="p-3 text-white">163.840.000</td><td className="p-3 text-purple-300">Düşman Ana Üslerine (X-1) Giriş!</td></tr>
                                            <tr className="bg-yellow-900/20"><td className="p-3 font-bold text-yellow-400">17+</td><td className="p-3 text-white">327.680.000</td><td className="p-3 text-yellow-300">TÜM HARİTALARA SINIRSIZ ERİŞİM</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">18</td><td className="p-3 text-white">655.360.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">19</td><td className="p-3 text-white">1.310.720.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">20</td><td className="p-3 text-white">2.621.440.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">21</td><td className="p-3 text-white">5.242.880.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">22</td><td className="p-3 text-white">10.485.760.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">23</td><td className="p-3 text-white">20.971.520.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">24</td><td className="p-3 text-white">41.943.040.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">25</td><td className="p-3 text-white">83.886.080.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-slate-800/30"><td className="p-3 font-bold text-slate-400">26</td><td className="p-3 text-white">167.772.160.000</td><td className="p-3 text-slate-500 font-mono text-center">-</td></tr>
                                            <tr className="bg-blue-900/40 border-t-2 border-blue-500"><td className="p-3 font-bold text-blue-300">27 (ELITE)</td><td className="p-3 text-white">335.544.320.000</td><td className="p-3 text-blue-200 font-bold glow-text">1-BL, 2-BL, 3-BL Haritalarına Erişim</td></tr>
                                            <tr className="bg-blue-900/30"><td className="p-3 font-bold text-blue-300">28 (ELITE)</td><td className="p-3 text-white">671.088.640.000</td><td className="p-3 text-slate-300">Elite Savaşçı Rütbesi</td></tr>
                                            <tr className="bg-blue-900/30"><td className="p-3 font-bold text-blue-300">29 (ELITE)</td><td className="p-3 text-white">1.342.177.280.000</td><td className="p-3 text-slate-300">Efsanevi Komutan Rütbesi</td></tr>
                                            <tr className="bg-blue-900/30"><td className="p-3 font-bold text-blue-300">30 (MAX)</td><td className="p-3 text-white">2.684.354.560.000</td><td className="p-3 text-amber-400 font-bold glow-text">KADİM SAVAŞÇI - MAKSİMUM GÜÇ</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rank' && (
                        <div className="animate-[fadeIn_0.3s]">
                            <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Info size={20} className="text-blue-400" /> Rütbe Hesaplama Mantığı</h3>
                                <p className="text-sm text-slate-300 mb-4">
                                    Rütbenizi arttırmak için; şeref, tecrübe puanı, canavar ve düşman gemisi öldürme sayısını arttırmanız gerekmektedir.
                                    Rütbeler belli bir kadro miktarına göre sınırlıdır. Bu kadro miktarı da Birlikteki (Krallık) toplam üye sayısına göre orantılanarak belirlenmektedir.
                                    Yani birinin rütbesi arttığında, başka birinin rütbesi düşebilir. <strong>Sıralama dinamiktir.</strong>
                                </p>
                                <div className="bg-black/40 p-3 rounded border border-slate-600 font-mono text-xs text-green-400">
                                    <h4 className="font-bold text-white mb-1">Hesaplama Formülü:</h4>
                                    <p>Birlikteki Üye Sayısı X Rütbe Yüzdesi (%) / 100 = O Rütbeye Sahip Kişi Sayısı</p>
                                    <p className="mt-2 text-slate-400">Örnek: 10.000 Üye X %1.5 (Bölük Komutanı) / 100 = 150 Adet Bölük Komutanı</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-bold text-red-400 mb-2">Rütbe Puanını Etkileyenler</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                                        <li>Tecrübe Puanı (TP)</li>
                                        <li>Şeref Puanı (ŞP)</li>
                                        <li>NPC Kesme (Canavar)</li>
                                        <li>Düşman Oyuncu Kesme</li>
                                        <li>Zindan Kapısı Tamamlama</li>
                                    </ul>
                                </div>
                                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                    <h4 className="text-lg font-bold text-blue-400 mb-2">Önemli Notlar</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-slate-300">
                                        <li>Rütbeler her sabah güncellenir.</li>
                                        <li>Başlangıç seviye yaratıklar +1 Rütbe Puanı kazandırır.</li>
                                        <li>Eksi (-) Şeref Puanı rütbenizi düşürür.</li>
                                        <li>Birlik değiştirmek Şeref Puanınızı %50 düşürür.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-[#5e4b35] shadow-lg">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#2a1d12] text-[#e6cba5]">
                                        <tr>
                                            <th className="p-3 border-b border-[#5e4b35]">Rütbe</th>
                                            <th className="p-3 border-b border-[#5e4b35]">Dağılım Kuralı</th>
                                            <th className="p-3 border-b border-[#5e4b35]">Hesaplanan Adet (10k Üye)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#5e4b35]/50 bg-[#1a1005]">
                                        {RANKS.sort((a, b) => (a.order || 0) - (b.order || 0)).map((rank, idx) => (
                                            <tr key={rank.id} className={idx % 2 === 0 ? 'bg-black/20' : ''}>
                                                <td className="p-3 font-bold text-white flex items-center gap-2">
                                                    <span className="text-xl">{rank.icon}</span> {rank.title}
                                                </td>
                                                <td className="p-3 text-slate-300">
                                                    {rank.limitType === 'count' ? (
                                                        <span className="text-yellow-400 font-bold">Birlik Başına {rank.limitValue} Adet</span>
                                                    ) : (
                                                        <span className="text-blue-400">Birliğin %{rank.limitValue}'i</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-slate-400 font-mono">
                                                    {rank.limitType === 'count' ? rank.limitValue : Math.floor(10000 * (rank.limitValue || 0) / 100)} Kişi
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'controls' && (
                        <div className="animate-[fadeIn_0.3s]">
                            {/* PC/Mobile Toggle */}
                            <div className="flex justify-center gap-2 mb-6">
                                <button
                                    onClick={() => setControlMode('pc')}
                                    className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${controlMode === 'pc' ? 'bg-purple-600 text-white shadow-[0_0_15px_#9333ea]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    <Keyboard size={18} /> PC / Klavye
                                </button>
                                <button
                                    onClick={() => setControlMode('mobile')}
                                    className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${controlMode === 'mobile' ? 'bg-purple-600 text-white shadow-[0_0_15px_#9333ea]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    📱 Mobil / Dokunmatik
                                </button>
                            </div>

                            {controlMode === 'pc' ? (
                                <div className="space-y-4">
                                    {/* Hareket */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2"><Move size={18} /> Hareket</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>İleri / Geri / Sol / Sağ</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded font-mono text-sm">W A S D</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Koş</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded font-mono text-sm">Shift + Hareket</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Kamerayı Döndür</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded font-mono text-sm">Sağ Tık + Sürükle</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Yakınlaştır/Uzaklaştır</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded font-mono text-sm">Mouse Tekerlek</span></div>
                                        </div>
                                    </div>

                                    {/* Savaş */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2"><Target size={18} /> Savaş</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Hedef Seç</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded font-mono text-sm">Sol Tık (Düşman)</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Normal Saldırı</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded font-mono text-sm">Space / Sol Tık</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Yetenekler</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded font-mono text-sm">1 2 3 4 5 6 7</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Can İksiri</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded font-mono text-sm">Q</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Mana İksiri</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded font-mono text-sm">E</span></div>
                                        </div>
                                    </div>

                                    {/* Arayüz */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><Settings size={18} /> Arayüz</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Envanter</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded font-mono text-sm">I</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Harita</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded font-mono text-sm">M</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Sohbet Aç/Kapa</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded font-mono text-sm">Enter</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Menü / Ayarlar</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded font-mono text-sm">Esc</span></div>
                                        </div>
                                    </div>

                                    {/* Sosyal */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2"><MessageSquare size={18} /> Sosyal</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>NPC ile Konuş</span><span className="px-2 py-1 bg-green-900/50 text-green-300 rounded font-mono text-sm">E (Yakınken)</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Oyuncu Menü</span><span className="px-2 py-1 bg-green-900/50 text-green-300 rounded font-mono text-sm">Sağ Tık (Oyuncuya)</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Düello İste</span><span className="px-2 py-1 bg-green-900/50 text-green-300 rounded font-mono text-sm">Hedef + Menü</span></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Mobil Hareket */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2"><Move size={18} /> Hareket</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Hareket Et</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">Sol Joystick Sürükle</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Kamerayı Döndür</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">Ekranda Sürükle</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Yakınlaştır/Uzaklaştır</span><span className="px-2 py-1 bg-purple-900/50 text-purple-300 rounded text-sm">İki Parmak Sıkıştır</span></div>
                                        </div>
                                    </div>

                                    {/* Mobil Savaş */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2"><Target size={18} /> Savaş</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Hedef Seç</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">Düşmana Dokun</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Normal Saldırı</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">Kılıç Butonu</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Yetenekler</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">Yetenek Butonları</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>İksir Kullan</span><span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm">İksir Butonları</span></div>
                                        </div>
                                    </div>

                                    {/* Mobil Arayüz */}
                                    <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                        <h4 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2"><Settings size={18} /> Arayüz</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Envanter</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded text-sm">Çanta İkonu</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Harita</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded text-sm">Harita İkonu</span></div>
                                            <div className="flex justify-between items-center p-2 bg-slate-800 rounded"><span>Ayarlar</span><span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded text-sm">Dişli İkonu</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg text-amber-200 text-sm text-center">
                                💡 Kontrolleri Ayarlar menüsünden özelleştirebilirsiniz
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
