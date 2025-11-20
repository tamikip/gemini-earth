
import React from 'react';
import { GameEvent, GameEventOption, Language } from '../types';
import { AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { audioService } from '../services/audioService';

interface EventModalProps {
  event: GameEvent | null;
  onResolve: (optionIndex: number) => void;
  loading: boolean;
  language: Language;
}

const EventModal: React.FC<EventModalProps> = ({ event, onResolve, loading, language }) => {
  const t = TRANSLATIONS[language];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="border border-cyan-500 p-8 bg-slate-900/90 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-cyan-400 font-orbitron tracking-widest animate-pulse">{t.loadingTitle}</h2>
          <p className="text-slate-400 text-sm font-rajdhani">{t.loadingDesc}</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className={`relative w-full max-w-2xl bg-slate-950 border ${event.severity === 'critical' ? 'border-red-600' : 'border-cyan-600'} rounded-lg p-1`}>
        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50"></div>

        <div className="bg-slate-900/90 p-6 rounded md:p-8">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-4">
            <AlertTriangle className={event.severity === 'critical' ? 'text-red-500' : 'text-cyan-500'} size={32} />
            <div>
              <h2 className={`text-2xl font-bold font-orbitron uppercase ${event.severity === 'critical' ? 'text-red-500' : 'text-cyan-400'}`}>
                {event.title}
              </h2>
              <p className="text-slate-500 text-sm uppercase tracking-widest">{t.location} {event.countryName}</p>
            </div>
          </div>

          <p className="text-slate-200 text-lg leading-relaxed font-rajdhani mb-8">
            {event.description}
          </p>

          <div className="grid gap-4">
            {event.options.map((opt: GameEventOption, idx: number) => (
              <button
                key={idx}
                onMouseEnter={() => audioService.playHover()}
                onClick={() => onResolve(idx)}
                className="group relative overflow-hidden border border-slate-600 bg-slate-800 hover:bg-slate-700 hover:border-cyan-400 transition-all p-4 text-left rounded flex flex-col gap-1"
              >
                <div className="flex justify-between items-center">
                  <span className="text-cyan-300 font-bold font-orbitron text-lg group-hover:text-cyan-200">
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    {t.actionRequired}
                  </span>
                </div>
                <p className="text-slate-300 text-sm font-rajdhani">{opt.description}</p>
                <div className="mt-2 text-xs text-emerald-400 font-mono border-t border-slate-700 pt-2 w-full">
                  &gt;&gt; {t.effect} {opt.effectDescription}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
