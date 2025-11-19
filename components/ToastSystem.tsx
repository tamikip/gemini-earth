
import React, { useEffect, useState } from 'react';
import { Toast } from '../types';
import { Check, AlertTriangle, Info, Zap, X, ShieldAlert, Radio } from 'lucide-react';

interface ToastSystemProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Trigger enter animation frame
    requestAnimationFrame(() => setHasMounted(true));

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 600); 
    }, 4000); 

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 500);
  };

  let borderColor = 'border-cyan-500';
  let textColor = 'text-cyan-400';
  let icon = <Info size={64} className="text-cyan-400 animate-pulse" />;
  let bgGradient = 'from-cyan-950/95 via-black/90 to-cyan-950/95';
  let glowColor = 'rgba(6,182,212,0.5)';

  switch (toast.type) {
    case 'success':
      borderColor = 'border-emerald-500';
      textColor = 'text-emerald-400';
      icon = <Check size={64} className="text-emerald-400 animate-[bounce_1s_infinite]" />;
      bgGradient = 'from-emerald-950/95 via-black/90 to-emerald-950/95';
      glowColor = 'rgba(16,185,129,0.5)';
      break;
    case 'warning':
      borderColor = 'border-amber-500';
      textColor = 'text-amber-400';
      icon = <Radio size={64} className="text-amber-400 animate-pulse" />;
      bgGradient = 'from-amber-950/95 via-black/90 to-amber-950/95';
      glowColor = 'rgba(245,158,11,0.5)';
      break;
    case 'error':
      borderColor = 'border-red-600';
      textColor = 'text-red-500';
      icon = <ShieldAlert size={64} className="text-red-500 animate-pulse" />;
      bgGradient = 'from-red-950/95 via-black/90 to-red-950/95';
      glowColor = 'rgba(220,38,38,0.6)';
      break;
    case 'info':
      borderColor = 'border-cyan-500';
      textColor = 'text-cyan-400';
      icon = <Zap size={64} className="text-cyan-400 animate-[spin_3s_linear_infinite]" />;
      bgGradient = 'from-cyan-950/95 via-black/90 to-cyan-950/95';
      glowColor = 'rgba(6,182,212,0.5)';
      break;
  }

  return (
    <div 
      className={`
        pointer-events-auto relative w-full max-w-6xl mx-auto
        transition-all duration-500 ease-out
        ${hasMounted && !isExiting ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        ${isExiting ? 'opacity-0 scale-x-150 blur-sm' : ''}
      `}
    >
      {/* Outer Glow Container */}
      <div 
        className="relative p-[2px] rounded-xl overflow-hidden"
        style={{ boxShadow: `0 0 60px ${glowColor}, inset 0 0 20px ${glowColor}` }}
      >
        {/* Animated Border Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} animate-pulse opacity-50`}></div>
        
        {/* Main Banner Body */}
        <div className={`
            relative flex flex-col md:flex-row items-center gap-8 py-8 px-12
            bg-gradient-to-r ${bgGradient}
            border-y-2 ${borderColor}
            backdrop-blur-xl
        `}>
            
            {/* Background Deco: Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
            
            {/* Background Deco: Hex Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {/* Left: Huge Icon with Ring */}
            <div className="relative z-10 shrink-0">
                <div className={`absolute inset-0 rounded-full blur-xl opacity-40 bg-current ${textColor}`}></div>
                <div className={`relative p-6 bg-black/60 border border-white/10 rounded-full backdrop-blur-md ring-1 ring-white/20`}>
                    {icon}
                </div>
            </div>

            {/* Center: Text Content */}
            <div className="flex-1 relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-4 mb-2 opacity-80">
                    <span className={`text-xs font-mono uppercase tracking-[0.3em] ${textColor} border border-current px-2 py-0.5 rounded`}>System Message</span>
                    <div className={`h-px w-32 bg-gradient-to-r from-current to-transparent ${textColor}`}></div>
                </div>
                
                <h3 className={`text-4xl md:text-5xl font-orbitron font-black uppercase tracking-widest ${textColor} drop-shadow-2xl leading-none mb-3`}>
                    {toast.title}
                </h3>
                
                <p className="text-xl md:text-2xl font-rajdhani font-medium text-slate-200 tracking-wide max-w-3xl">
                    {toast.message}
                </p>
            </div>

            {/* Right: Dismiss & Deco */}
            <div className="relative z-10 flex flex-col items-end justify-between h-full gap-4">
                <button 
                    onClick={handleDismiss}
                    className={`p-2 rounded-full border border-white/10 bg-black/40 hover:bg-white/10 ${textColor} transition-all`}
                >
                    <X size={24} />
                </button>
                
                {/* Animated Bar Code Deco */}
                <div className="hidden md:flex gap-1 h-12 items-end opacity-40">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 bg-current ${textColor} animate-[pulse_1s_ease-in-out_infinite]`} style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                </div>
            </div>
            
            {/* Horizontal animated laser line on enter */}
            <div className={`absolute bottom-0 left-0 h-[2px] bg-white/50 shadow-[0_0_10px_white] z-20 animate-[expandWidth_0.8s_ease-out_forwards] w-full`}></div>
        </div>
      </div>
    </div>
  );
};

const ToastSystem: React.FC<ToastSystemProps> = ({ toasts, onRemove }) => {
  // Only show the most recent toast to avoid cluttering the center screen
  const activeToast = toasts[toasts.length - 1];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4 md:px-0">
      {activeToast && (
        <div className="w-full max-w-6xl">
           <ToastItem key={activeToast.id} toast={activeToast} onRemove={onRemove} />
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes expandWidth {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
      `}} />
    </div>
  );
};

export default ToastSystem;
