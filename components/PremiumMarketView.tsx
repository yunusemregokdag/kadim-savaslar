
import React, { useState } from 'react';
import { PlayerState } from '../types';
import { Coins, Diamond, Shield, Crown, Star, Package, CreditCard, ShoppingCart, Check, Sparkles, Sword, Feather } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { COSTUME_SETS } from '../constants';

interface PremiumMarketViewProps {
    playerState: PlayerState;
    onBuyData: (category: 'currency' | 'item' | 'subscription', id: string, cost: number, currency: 'real' | 'gold' | 'gems', amount?: number) => void;
    onEquipCostume?: (costumeId: string | null) => void;
    onClose: () => void;
    isEmbedded?: boolean;
}

export const PremiumMarketView: React.FC<PremiumMarketViewProps> = ({ playerState, onBuyData, onEquipCostume, onClose, isEmbedded = false }) => {
    const [activeTab, setActiveTab] = useState<'currency' | 'items' | 'costumes' | 'subscription'>('costumes'); // Default to costumes to show new sets first

    const PREMIUM_CURRENCY_PACKS = [
        { id: 'gems_small', name: 'Avuç Dolusu Elmas', amount: 100, bonus: 0, cost: 49.99, icon: Diamond, color: 'text-cyan-400' },
        { id: 'gems_medium', name: 'Elmas Kesesi', amount: 600, bonus: 50, cost: 249.99, icon: Diamond, color: 'text-cyan-400' },
        { id: 'gems_large', name: 'Elmas Sandığı', amount: 1400, bonus: 200, cost: 499.99, icon: Diamond, color: 'text-cyan-400' },
        { id: 'gold_small', name: 'Altın Kesesi', amount: 10000, bonus: 0, cost: 19.99, icon: Coins, color: 'text-yellow-400' },
        { id: 'gold_medium', name: 'Altın Sandığı', amount: 60000, bonus: 5000, cost: 99.99, icon: Coins, color: 'text-yellow-400' },
        { id: 'gold_large', name: 'Hazine Odası', amount: 140000, bonus: 20000, cost: 199.99, icon: Coins, color: 'text-yellow-400' },
    ];

    const PREMIUM_ITEMS = [
        // STARTER PACK (Acemi Paketi - Çok Ucuz!)
        { id: 'starter_pack', name: 'Acemi Savaşçı Paketi', desc: 'Maceraya hızlı başla! +5 T2 Silah ve Potlar.', cost: 25, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-amber-300', border: 'border-amber-400', bg: 'bg-amber-950/40' },

        { id: 'pragmatic_bundle', name: 'Pragmatik Set', desc: 'Sadelik ve gücün mükemmel uyumu.', cost: 400, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-amber-400', border: 'border-amber-500/50', bg: 'bg-amber-900/20' },
        { id: 'ninja_bundle', name: 'Gölge Ninja Seti', desc: 'Karanlıkta görünmez ol, düşmanlarını şaşırt.', cost: 600, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-slate-400', border: 'border-slate-500/50', bg: 'bg-slate-900/20' },
        { id: 'santa_bundle', name: 'Noel Baba Kostümü', desc: 'Savaş alanına neşe (ve hediye) getir!', cost: 500, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-900/20' },
        { id: 'void_bundle', name: 'Hiçlik Gezgini', desc: 'Evrenin derinliklerinden gelen gizemli güç.', cost: 800, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-purple-400', border: 'border-purple-500/50', bg: 'bg-purple-900/20' },
        { id: 'cyber_bundle', name: 'Siber Savaşçı', desc: 'Geleceğin teknolojisi ile donatılmış zırh.', cost: 750, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-cyan-400', border: 'border-cyan-500/50', bg: 'bg-cyan-900/20' },
        { id: 'vampire_bundle', name: 'Kan Kontu', desc: 'Aristokratik görünüm ve ölümcül zarafet.', cost: 650, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-red-600', border: 'border-red-700/50', bg: 'bg-red-950/20' },
        { id: 'paladin_bundle', name: 'Işık Şövalyesi', desc: 'Kutsal ışığın koruyucusu ol.', cost: 700, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-yellow-200', border: 'border-yellow-300/50', bg: 'bg-yellow-900/20' },
        { id: 'samurai_bundle', name: 'Samuray Onuru', desc: 'Keskin kılıç, sarsılmaz irade.', cost: 600, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-rose-400', border: 'border-rose-500/50', bg: 'bg-rose-900/20' },
        { id: 'pirate_bundle', name: 'Denizlerin Hakimi', desc: 'Macera peşinde koşanlar için.', cost: 550, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-900/20' },
        { id: 'angel_bundle', name: 'Semavi Muhafız', desc: 'Gökyüzünden gelen ilahi güç.', cost: 900, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-sky-200', border: 'border-sky-300/50', bg: 'bg-sky-900/20' },
        { id: 'demon_bundle', name: 'Cehennem Lordu', desc: 'Ateş ve yıkımın vücut bulmuş hali.', cost: 900, currency: 'gems', items: ['helmet', 'armor', 'pants', 'weapon'], color: 'text-red-500', border: 'border-red-600/50', bg: 'bg-red-950/30' },
    ];

    const SUBSCRIPTION_BENEFITS = [
        "Her gün +50 Bonus Elmas",
        "%20 Daha Fazla EXP Kazanımı",
        "%20 Daha Fazla Altın Kazanımı",
        "Özel 'Premium' İsim Rengi (Altın)",
        "Pazar Listeleme Ücreti Yok",
        "Özel Kanal Erişimi"
    ];

    return (
        <div className="h-full flex flex-col bg-[#0f0a15] text-white">
            {/* Header */}
            {!isEmbedded && (
                <div className="p-6 border-b border-purple-900/50 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
                            <Crown size={28} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-indigo-200 bg-clip-text text-transparent">Premium Market</h2>
                            <p className="text-purple-300/60 text-sm">Destek ol, güçlen ve farkını ortaya koy!</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded border border-slate-700">
                            <Coins size={16} className="text-yellow-400" />
                            <span className="font-bold">{playerState.credits}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded border border-slate-700">
                            <Diamond size={16} className="text-cyan-400" />
                            <span className="font-bold">{playerState.gems}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            X
                        </button>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-purple-900/30 px-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('costumes')}
                    className={`px-6 py-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'costumes' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Sparkles size={18} />
                    3D Kostümler
                </button>
                <button
                    onClick={() => setActiveTab('items')}
                    className={`px-6 py-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'items' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Package size={18} />
                    Kostüm Paketleri
                </button>
                <button
                    onClick={() => setActiveTab('currency')}
                    className={`px-6 py-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'currency' ? 'border-yellow-500 text-yellow-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Coins size={18} />
                    Altın & Elmas
                </button>
                <button
                    onClick={() => setActiveTab('subscription')}
                    className={`px-6 py-4 font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'subscription' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Crown size={18} />
                    VIP Üyelik
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* 3D COSTUME SETS (NEW!) */}
                {activeTab === 'costumes' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">3D Kostüm Setleri</h3>
                            <p className="text-slate-400 text-sm mt-1">Sınıfına özel silah + kanat + şapka içerir!</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {COSTUME_SETS.map(set => {
                                const isOwned = playerState.ownedCostumes && playerState.ownedCostumes.includes(set.id);
                                const isEquipped = playerState.equippedCostume === set.id;
                                return (
                                    <div key={set.id} className={`relative overflow-hidden rounded-2xl border-2 transition-all group hover:scale-[1.02] hover:shadow-2xl
                                        ${isOwned ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/30'}`}>

                                        {/* Top Glow */}
                                        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-emerald-600/20 to-transparent pointer-events-none" />

                                        {/* Tier Badge */}
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r from-amber-600 to-yellow-600 text-white text-[10px] font-black uppercase rounded shadow-lg">
                                            T{set.tier} Premium
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Header */}
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                                                    <Sparkles size={28} className="text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white">{set.name}</h4>
                                                    <p className="text-xs text-emerald-400 uppercase tracking-wider font-bold">{set.theme} Theme</p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-slate-400 mb-4">{set.description}</p>

                                            {/* Contents */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <div className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-1">
                                                    <Sword size={12} className="text-red-400" />
                                                    <span className="text-slate-300">10 Sınıf Silahı</span>
                                                </div>
                                                {set.wing && (
                                                    <div className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-1">
                                                        <Feather size={12} className="text-violet-400" />
                                                        <span className="text-slate-300">Kanat</span>
                                                    </div>
                                                )}
                                                {set.hat && (
                                                    <div className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-1">
                                                        <Crown size={12} className="text-amber-400" />
                                                        <span className="text-slate-300">Şapka</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bonus Stats */}
                                            {(set.bonusDamage || set.bonusHp || set.bonusDefense) && (
                                                <div className="flex gap-2 mb-4 text-xs">
                                                    {set.bonusDamage && <span className="text-red-400">+{set.bonusDamage} DMG</span>}
                                                    {set.bonusHp && <span className="text-green-400">+{set.bonusHp} HP</span>}
                                                    {set.bonusDefense && <span className="text-blue-400">+{set.bonusDefense} DEF</span>}
                                                </div>
                                            )}

                                            {/* Price & Buy */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                                <div className="flex items-center gap-2">
                                                    <Diamond size={18} className="text-cyan-400" />
                                                    <span className="text-xl font-black text-white">{set.price}</span>
                                                </div>
                                                {isOwned ? (
                                                    <button
                                                        onClick={() => onEquipCostume && onEquipCostume(isEquipped ? null : set.id)}
                                                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all
                                                            ${isEquipped
                                                                ? 'bg-red-900/50 text-red-400 hover:bg-red-800/50'
                                                                : 'bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800/50'}`}
                                                    >
                                                        {isEquipped ? (
                                                            <><span className="text-lg">❌</span> Çıkar</>
                                                        ) : (
                                                            <><Sparkles size={16} /> Kuşan</>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onBuyData('item', set.id, set.price, 'gems')}
                                                        disabled={playerState.gems < set.price}
                                                        className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                                                            ${playerState.gems >= set.price
                                                                ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-900/30'
                                                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                                    >
                                                        <ShoppingCart size={16} />
                                                        Satın Al
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* CURRENCY PACKS */}
                {activeTab === 'currency' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PREMIUM_CURRENCY_PACKS.map(pack => (
                            <div key={pack.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center text-center hover:border-slate-500 transition-all group">
                                <div className={`w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${pack.color}`}>
                                    <pack.icon size={40} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{pack.name}</h3>
                                {pack.bonus > 0 && <span className="text-xs font-bold text-green-400 mb-2">+{pack.bonus} Bonus!</span>}
                                <div className="text-2xl font-black text-white mb-6">
                                    {pack.amount.toLocaleString()} <span className="text-sm font-normal text-slate-400">{pack.icon === Diamond ? 'Elmas' : 'Altın'}</span>
                                </div>
                                <button
                                    onClick={() => onBuyData('currency', pack.id, pack.cost, 'real', pack.amount + pack.bonus)}
                                    className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg shadow-green-900/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    <CreditCard size={16} />
                                    {pack.cost} TL
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* PREMIUM ITEMS / SKINS */}
                {activeTab === 'items' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {PREMIUM_ITEMS.map(item => {
                            const isOwned = playerState.ownedSkins && playerState.ownedSkins.includes(item.id);

                            return (
                                <div key={item.id} className={`${item.bg} ${item.border} border rounded-xl p-6 flex flex-col hover:border-opacity-100 border-opacity-50 transition-all group relative overflow-hidden shadow-lg hover:shadow-2xl`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 bg-black/30 rounded-lg ${item.color}`}>
                                            <Package size={24} />
                                        </div>
                                        <div className={`px-2 py-1 bg-black/30 rounded text-xs ${item.color} uppercase tracking-wider font-bold`}>
                                            Kostüm Seti
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                                    <p className={`text-sm opacity-70 mb-6 flex-1 ${item.color}`}>{item.desc}</p>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center gap-2">
                                                <Diamond size={16} className="text-cyan-400" />
                                                <span className="font-bold text-lg text-white">{item.cost}</span>
                                            </div>
                                            {isOwned ? (
                                                <button disabled className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg font-bold flex items-center gap-2 cursor-not-allowed">
                                                    <Check size={16} />
                                                    Satın Alındı
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onBuyData('item', item.id, item.cost, 'gems')}
                                                    className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white`}
                                                >
                                                    <ShoppingCart size={16} />
                                                    Satın Al
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* SUBSCRIPTION */}
                {activeTab === 'subscription' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-1 border border-indigo-500/50 shadow-2xl relative overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -mr-20 -mt-20"></div>

                            <div className="bg-[#0f0a15]/90 rounded-xl p-8 backdrop-blur-sm h-full flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-900/50">
                                    <Crown size={40} className="text-white fill-white/20" />
                                </div>

                                <h2 className="text-3xl font-black text-white mb-2">KADİM VIP ÜYELİK</h2>
                                <p className="text-indigo-300 mb-8 max-w-md">Gerçek bir efsane gibi oyna. Sınırsız potansiyelini açığa çıkar ve rakiplerinin önüne geç.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-8 text-left">
                                    {SUBSCRIPTION_BENEFITS.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-indigo-950/50 rounded-lg border border-indigo-800/50">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                <Check size={14} className="text-green-400" />
                                            </div>
                                            <span className="text-sm font-medium text-indigo-100">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto w-full">
                                    <div className="flex flex-col gap-3">
                                        <div className="text-3xl font-bold text-white">
                                            149.99 TL <span className="text-lg text-slate-400 font-normal">/ Ay</span>
                                        </div>
                                        <button
                                            onClick={() => onBuyData('subscription', 'vip_1_month', 149.99, 'real')}
                                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
                                        >
                                            <Star fill="currentColor" size={20} />
                                            HEMEN KATIL
                                        </button>
                                        <p className="text-xs text-slate-500 mt-2">İstediğin zaman iptal edebilirsin.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
