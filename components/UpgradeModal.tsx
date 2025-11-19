import React from 'react';
import { Protocol, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { audioService } from '../services/audioService';
import { Cpu, Zap, Activity, Shield, Crosshair, Wifi, Gem, Orbit, Disc } from 'lucide-react';

interface UpgradeModalProps {
  protocols: Protocol[];
  onSelect: (protocolId: string) => void;
  language: Language;
}

const IconMap: Record<string, React.ElementType> = {
  Cpu, Zap, Activity, Shield, Crosshair, Wifi, Gem, Orbit
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({ protocols, onSelect, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="max-w-5xl w-full flex flex-col items-center">
        <h2 className="text-4xl font-orbitron font-bold text-cyan-400 mb-2 text-center animate-pulse shadow-cyan-500/50 drop-shadow-lg">
          {t.upgrades}
        </h2>
        <p className="text-slate-400 font-rajdhani mb-8 text-center">{t.upgradeDesc}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {protocols.map((p) => {
            const Icon = IconMap[p.icon] || Disc;
            const info = t.protocols[p.id as keyof typeof t.protocols] || { name: p.id, desc: "Unknown Protocol" };
            
            return (
              <button
                key={p.id}
                onMouseEnter={() => audioService.playHover()}
                onClick={() => { audioService.playClick(); onSelect(p.id); }}
                className={`
                  relative group flex flex-col items-center text-center p-8 rounded-xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                  ${p.rarity === 'legendary' ? 'bg-slate-900/80 border-amber-500/50 hover:border-amber-400' : 
                    p.rarity === 'rare' ? 'bg-slate-900/80 border-purple-500/50 hover:border-purple-400' : 
                    'bg-slate-900/80 border-cyan-500/30 hover:border-cyan-400'}
                `}
              >
                <div className={`
                  mb-6 p-4 rounded-full border-2 bg-black/40
                  ${p.rarity === 'legendary' ? 'border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                    p.rarity === 'rare' ? 'border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 
                    'border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]'}
                `}>
                  <Icon size={48} />
                </div>
                
                <h3 className={`text-xl font-orbitron font-bold mb-2 ${
                  p.rarity === 'legendary' ? 'text-amber-400' : 
                  p.rarity === 'rare' ? 'text-purple-400' : 'text-cyan-300'
                }`}>
                  {info.name}
                </h3>
                
                <p className="text-slate-300 font-rajdhani text-lg leading-tight mb-4 min-h-[3rem]">
                  {info.desc}
                </p>

                <div className="mt-auto text-xs font-mono uppercase tracking-widest opacity-50">
                  [{p.rarity} PROTOCOL]
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;