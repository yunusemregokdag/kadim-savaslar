
import React from 'react';
import { ClassData } from '../types';
import { Swords, Shield, Zap, Flame, Droplet, Wind, Gift, Crosshair, Ghost, Skull, Target, CloudRain, Activity, RotateCw, Mic, MoveDown, ArrowUp, ArrowRight, Diff, EyeOff, Trees, Feather, Heart, Sun, Orbit, Snowflake, Cloud, Users } from 'lucide-react';

interface SkillTreeProps {
  playerClass: ClassData;
  playerLevel: number;
}

const SkillTree: React.FC<SkillTreeProps> = ({ playerClass, playerLevel }) => {

  // Guard against missing class data
  if (!playerClass) {
    console.warn("SkillTree: playerClass is null or undefined");
    return null;
  }

  const icons: any = {
    Sword: Swords, Shield: Shield, Zap: Zap, Flame: Flame, Snowflake: Snowflake,
    Wind: Wind, Heart: Heart, Crosshair: Crosshair, Ghost: Ghost, Skull: Skull,
    Target: Target, Cloud: Cloud, Sun: Sun, Orbit: Orbit, Droplet: Droplet, // Changed Asteroid to Orbit
    Activity: Activity, RotateCw: RotateCw, Mic: Mic, MoveDown: MoveDown, ArrowUp: ArrowUp,
    ArrowRight: ArrowRight, Diff: Diff, EyeOff: EyeOff, Trees: Trees, Feather: Feather,
    CloudRain: CloudRain, Users: Users, Amblem: Shield
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-700">
        <h2 className="text-2xl rpg-font text-white mb-2">Yetenekler: {playerClass.name}</h2>
        <p className="text-slate-400 text-sm">
          Seviye {playerLevel}. Aşağıda sınıfına ait aktif yetenekler bulunmaktadır.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {playerClass.skills.map((skill, idx) => {
          const Icon = icons[skill.icon] || Zap;
          // Mock level requirement for display purposes
          const levelReq = [1, 3, 5, 10, 15, 20, 30][idx] || 1;
          const isUnlocked = playerLevel >= levelReq;
          const isUltimate = skill.type === 'ultimate';

          return (
            <div key={skill.id} className={`group relative p-1 rounded-xl transition-all duration-300 ${isUnlocked ? 'hover:scale-105 hover:z-10' : 'opacity-60 grayscale'}`}>
              {/* Fantasy Border Effect */}
              <div className={`absolute inset-0 rounded-xl ${isUnlocked ? (isUltimate ? 'bg-gradient-to-br from-purple-600 via-fuchsia-500 to-indigo-600 animate-pulse' : 'bg-gradient-to-br from-yellow-600 via-orange-500 to-amber-700') : 'bg-slate-700'} -z-10`} />
              <div className="absolute inset-[1px] bg-slate-900 rounded-[10px] -z-10" />

              <div className="p-4 relative h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isUnlocked ? (isUltimate ? 'bg-purple-950 border-purple-400 text-purple-200' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-600 text-yellow-500') : 'bg-slate-950 border-slate-700 text-slate-600'}`}>
                    <Icon size={32} strokeWidth={1.5} className={isUnlocked ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border mb-1 whitespace-nowrap ${isUnlocked ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
                      {isUnlocked ? 'AÇIK' : `KİLİTLİ LVL ${levelReq}`}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isUltimate ? 'bg-purple-900/20 text-purple-300 border-purple-800' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                      {isUltimate ? 'ULTIMATE' : skill.type.toUpperCase()}
                    </span>
                  </div>
                </div>

                <h4 className={`text-lg font-bold mb-1 rpg-font tracking-wide ${isUnlocked ? (isUltimate ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' : 'text-yellow-100') : 'text-slate-500'}`}>
                  {skill.name}
                </h4>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-700 to-transparent my-2" />

                <p className="text-xs text-slate-400 mb-4 min-h-[40px] leading-relaxed">{skill.description}</p>

                <div className="flex items-center gap-3 mt-auto text-xs font-medium">
                  <div className="flex items-center gap-1 text-blue-300 bg-blue-950/50 px-2 py-1 rounded border border-blue-900/50">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_blue]" />
                    {skill.manaCost} Mana
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                    <RotateCw size={10} />
                    {skill.cd}s
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default SkillTree;
