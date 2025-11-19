import React, { useRef, useState, useEffect } from 'react';
import { Skill, Language, Resources } from '../types';
import { TRANSLATIONS } from '../constants';
import { audioService } from '../services/audioService';
import { 
  Crosshair, Shield, Sword, Wifi, Brain, Radio, Activity, Zap, Database, 
  Lock, Check, X, Cpu, Network, Skull, Eye, Globe, Ghost, Sun, Server, 
  Battery, Shuffle, TrendingUp, MousePointer2, Plus, Minus
} from 'lucide-react';

interface SkillTreeModalProps {
  skills: Skill[];
  unlockedSkills: string[];
  resources: Resources;
  onUnlock: (skillId: string) => void;
  onClose: () => void;
  language: Language;
}

const IconMap: Record<string, React.ElementType> = {
  Crosshair, Shield, Sword: Sword, Swords: Sword, Wifi, Brain, Radio, 
  Activity, Zap, Database, Skull, Eye, Globe, Ghost, Sun, Server, 
  Battery, Shuffle, TrendingUp, Network, Lock, Cpu
};

// --- SVG Hexagon Component for high fidelity borders ---
const HexagonShape: React.FC<{ 
  className?: string; 
  fill?: string; 
  stroke?: string; 
  strokeWidth?: number; 
  children?: React.ReactNode;
}> = ({ className, fill = "none", stroke = "currentColor", strokeWidth = 2, children }) => (
  <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
    <svg viewBox="0 0 100 116" className="absolute inset-0 w-full h-full overflow-visible">
      <path 
        d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 L50 0 Z" 
        fill={fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth} 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <div className="relative z-10 pointer-events-none">{children}</div>
  </div>
);

const HexNode: React.FC<{
  skill: Skill;
  status: 'locked' | 'available' | 'unlocked';
  selected: boolean;
  onClick: () => void;
}> = ({ skill, status, selected, onClick }) => {
  const Icon = IconMap[skill.icon] || Activity;

  let fillColor = 'rgba(15, 23, 42, 0.9)'; // Slate 900
  let strokeColor = '#334155'; // Slate 700
  let iconColor = 'text-slate-600';
  let glowClass = '';
  let strokeWidth = 2;

  if (status === 'unlocked') {
    if (skill.branch === 'dominion') { 
      fillColor = 'rgba(69, 10, 10, 0.9)'; // Red 950
      strokeColor = '#ef4444'; 
      iconColor = 'text-red-200'; 
      glowClass = 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'; 
    } else if (skill.branch === 'manipulation') { 
      fillColor = 'rgba(59, 7, 100, 0.9)'; // Purple 950
      strokeColor = '#a855f7'; 
      iconColor = 'text-purple-200'; 
      glowClass = 'drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'; 
    } else { 
      fillColor = 'rgba(2, 44, 34, 0.9)'; // Emerald 950
      strokeColor = '#10b981'; 
      iconColor = 'text-emerald-200'; 
      glowClass = 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'; 
    }
  } else if (status === 'available') {
    fillColor = 'rgba(30, 41, 59, 0.9)'; // Slate 800
    strokeColor = '#eab308'; // Yellow 500
    iconColor = 'text-yellow-400';
    glowClass = 'animate-pulse drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]';
  }

  if (selected) {
    strokeColor = '#ffffff';
    strokeWidth = 4;
    glowClass += ' drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]';
  }

  return (
    <div 
      onMouseEnter={() => audioService.playHover()}
      onClick={(e) => { 
          e.stopPropagation(); 
          audioService.playClick();
          onClick(); 
      }}
      className={`absolute w-14 h-16 cursor-pointer transition-transform duration-300 hover:scale-125 z-10 flex items-center justify-center ${glowClass}`}
      style={{ 
        left: skill.position.x, 
        top: skill.position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <HexagonShape 
        fill={fillColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth}
      >
         <Icon size={24} className={iconColor} />
      </HexagonShape>
    </div>
  );
};

const SkillTreeModal: React.FC<SkillTreeModalProps> = ({ skills, unlockedSkills, resources, onUnlock, onClose, language }) => {
  const t = TRANSLATIONS[language];
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 }); // Pan x,y and Zoom k
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  // Initialize view to center
  useEffect(() => {
     if (containerRef.current) {
         const { offsetWidth, offsetHeight } = containerRef.current;
         setTransform({ x: offsetWidth / 2, y: offsetHeight / 2, k: 0.8 }); // Start slightly zoomed out
     }
  }, []);

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Logic
  const handleZoom = (delta: number) => {
    setTransform(prev => ({
      ...prev,
      k: Math.min(2, Math.max(0.4, prev.k + delta))
    }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta);
  };

  const getSkillStatus = (skill: Skill) => {
    if (unlockedSkills.includes(skill.id)) return 'unlocked';
    if (!skill.parentId || unlockedSkills.includes(skill.parentId)) return 'available';
    return 'locked';
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden font-rajdhani text-slate-200">
      
      {/* UI Overlay Layer */}
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 z-50 p-3 bg-slate-900/80 backdrop-blur border border-red-500/50 text-red-400 hover:bg-red-900/40 hover:text-white rounded-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      >
        <X size={24} />
      </button>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
        <button onClick={() => handleZoom(0.2)} className="p-3 bg-slate-800/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50 rounded-lg transition-colors">
           <Plus size={20} />
        </button>
        <button onClick={() => handleZoom(-0.2)} className="p-3 bg-slate-800/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/50 rounded-lg transition-colors">
           <Minus size={20} />
        </button>
      </div>

      {/* Legend / Header */}
      <div className="absolute top-6 left-6 z-50 pointer-events-none">
        <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          {t.skillTreeTitle}
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase opacity-80">{t.skillTreeDesc}</p>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className={`w-full h-full relative bg-slate-950 overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        
        {/* Background Grid with Parallax-like effect via scale */}
        <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
                backgroundImage: `
                    linear-gradient(to right, #1e293b 1px, transparent 1px),
                    linear-gradient(to bottom, #1e293b 1px, transparent 1px)
                `,
                backgroundSize: `${40 * transform.k}px ${40 * transform.k}px`,
                transform: `translate(${transform.x % (40 * transform.k)}px, ${transform.y % (40 * transform.k)}px)`
            }}
        ></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>


        {/* Transform Layer */}
        <div 
          className="absolute left-0 top-0 w-0 h-0"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})` }}
        >
          
          {/* Connections Layer */}
          {/* We render this inside the transform layer so lines scale with nodes */}
          <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }}>
             <defs>
                <filter id="glow-line">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            {skills.map(skill => {
              if (!skill.parentId) return null;
              const parent = skills.find(p => p.id === skill.parentId);
              if (!parent) return null;

              const isUnlocked = unlockedSkills.includes(skill.id);
              const isAvailable = !skill.parentId || unlockedSkills.includes(skill.parentId);
              
              let strokeColor = '#1e293b'; // Slate 800 (Hidden/Dark)
              let dashArray = 'none';
              let animationClass = '';

              if (isUnlocked) {
                 if (skill.branch === 'dominion') strokeColor = '#ef4444';
                 else if (skill.branch === 'manipulation') strokeColor = '#a855f7';
                 else strokeColor = '#10b981';
                 dashArray = '10, 10';
                 animationClass = 'animate-[dash_20s_linear_infinite]'; // Custom CSS animation needed for dash offset if not in Tailwind
              } else if (isAvailable) {
                 strokeColor = '#475569'; // Slate 600
                 dashArray = '5, 5';
              }

              return (
                <g key={`${parent.id}-${skill.id}`}>
                     {/* Glow effect line (only if unlocked) */}
                     {isUnlocked && (
                        <line 
                            x1={parent.position.x} y1={parent.position.y} 
                            x2={skill.position.x} y2={skill.position.y} 
                            stroke={strokeColor} 
                            strokeWidth={4}
                            opacity={0.3}
                            filter="url(#glow-line)"
                        />
                     )}
                    <line 
                    x1={parent.position.x} y1={parent.position.y} 
                    x2={skill.position.x} y2={skill.position.y} 
                    stroke={strokeColor} 
                    strokeWidth={isUnlocked ? 2 : 1}
                    strokeDasharray={dashArray}
                    className={`transition-colors duration-500 ${animationClass}`}
                    />
                </g>
              );
            })}
          </svg>

          {/* Center Core Node (Decor) */}
          <div className="absolute w-24 h-24 bg-black/50 border-2 border-cyan-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_50px_rgba(6,182,212,0.4)] flex items-center justify-center z-0">
             <div className="w-20 h-20 rounded-full border border-cyan-500/50 animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute w-16 h-16 rounded-full border border-cyan-400/30 animate-[spin_15s_linear_infinite_reverse]"></div>
             <Cpu className="absolute text-cyan-400 drop-shadow-[0_0_10px_cyan]" size={32} />
          </div>

          {/* Skill Nodes */}
          {skills.map(skill => (
            <HexNode 
              key={skill.id}
              skill={skill}
              status={getSkillStatus(skill)}
              selected={selectedSkillId === skill.id}
              onClick={() => setSelectedSkillId(skill.id)}
            />
          ))}
        </div>
      </div>

      {/* Inspector Panel (Sidebar) - Slide Over */}
      <div className={`absolute top-0 right-0 h-full w-96 bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/30 shadow-2xl transition-transform duration-500 z-40 p-0 flex flex-col ${selectedSkillId ? 'translate-x-0' : 'translate-x-full'}`}>
         {selectedSkill ? (
           <>
             {/* Panel Header */}
             <div className={`relative p-8 pb-6 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent`}>
                {/* Branch Indicator */}
                <div className="absolute top-4 right-4">
                   <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${
                       selectedSkill.branch === 'dominion' ? 'bg-red-500 text-red-500' : 
                       selectedSkill.branch === 'manipulation' ? 'bg-purple-500 text-purple-500' : 'bg-emerald-500 text-emerald-500'
                   }`}></div>
                </div>

                <h3 className="text-xs text-cyan-400 font-mono mb-2 tracking-[0.2em] uppercase opacity-80">
                   // {t.branches[selectedSkill.branch as keyof typeof t.branches]}
                </h3>
                <h2 className="text-3xl font-orbitron font-bold text-white uppercase mb-4 leading-none drop-shadow-md">
                   {t.skills[selectedSkill.id as keyof typeof t.skills]?.name}
                </h2>
                
                <div className="flex flex-wrap gap-2 mb-2">
                   {getSkillStatus(selectedSkill) === 'unlocked' ? (
                      <span className="px-2 py-1 bg-cyan-900/50 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 rounded flex items-center gap-1 tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        <Check size={10} /> {t.installed}
                      </span>
                   ) : getSkillStatus(selectedSkill) === 'locked' ? (
                      <span className="px-2 py-1 bg-slate-800/80 text-slate-500 text-[10px] font-bold border border-slate-700 rounded flex items-center gap-1 tracking-wider">
                        <Lock size={10} /> {t.locked}
                      </span>
                   ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold border border-yellow-500/30 rounded animate-pulse tracking-wider flex items-center gap-1">
                        <Activity size={10} /> READY TO INSTALL
                      </span>
                   )}
                   <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700 rounded">
                     TIER {selectedSkill.tier}
                   </span>
                   {selectedSkill.type === 'active' && (
                       <span className="px-2 py-1 bg-pink-900/50 text-pink-300 text-[10px] font-bold border border-pink-500/30 rounded flex items-center gap-1 tracking-wider">
                           ACTIVE ABILITY
                       </span>
                   )}
                </div>
             </div>
             
             {/* Panel Body */}
             <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                <div className="p-4 bg-slate-900/50 border-l-2 border-cyan-500/50 rounded-r">
                    <p className="text-slate-300 leading-relaxed font-rajdhani text-lg">
                    {t.skills[selectedSkill.id as keyof typeof t.skills]?.desc}
                    </p>
                </div>

                {/* Effect Stats (Mock visual) */}
                <div className="space-y-2">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sys. Impact Analysis</div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-slate-800 rounded overflow-hidden">
                             <div className="h-full bg-cyan-500 w-3/4"></div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400">OPTIMIZATION</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-slate-800 rounded overflow-hidden">
                             <div className="h-full bg-purple-500 w-1/2"></div>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400">COMPLEXITY</span>
                    </div>
                </div>
             </div>

             {/* Panel Footer (Action) */}
             <div className="p-8 pt-0 mt-auto bg-gradient-to-t from-slate-950 to-transparent">
                {getSkillStatus(selectedSkill) !== 'unlocked' && (
                    <div className="bg-black/40 p-4 rounded border border-slate-800 mb-4 backdrop-blur-sm">
                        <div className="text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-bold flex justify-between">
                            <span>Installation Requirements</span>
                            {getSkillStatus(selectedSkill) === 'locked' && <span className="text-red-500">PREREQUISITES MISSING</span>}
                        </div>
                        <div className="flex justify-between items-center font-mono text-lg">
                             <div className={`flex items-center gap-2 ${resources.credits >= selectedSkill.cost.credits ? 'text-yellow-400' : 'text-red-500 opacity-80'}`}>
                                 <Activity size={18} />
                                 {selectedSkill.cost.credits}
                             </div>
                             <div className={`flex items-center gap-2 ${resources.energy >= selectedSkill.cost.energy ? 'text-cyan-400' : 'text-red-500 opacity-80'}`}>
                                 <Zap size={18} />
                                 {selectedSkill.cost.energy}
                             </div>
                        </div>
                    </div>
                )}

                <button
                  onClick={() => onUnlock(selectedSkill.id)}
                  disabled={getSkillStatus(selectedSkill) !== 'available' || resources.credits < selectedSkill.cost.credits || resources.energy < selectedSkill.cost.energy}
                  className={`
                    w-full py-5 font-orbitron font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden group clip-corner
                    ${getSkillStatus(selectedSkill) === 'unlocked' 
                      ? 'bg-slate-900 text-slate-600 cursor-default border border-slate-800' 
                      : getSkillStatus(selectedSkill) === 'locked'
                        ? 'bg-slate-900 text-slate-700 cursor-not-allowed border border-slate-800'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                    }
                  `}
                >
                   <span className="relative z-10 flex items-center justify-center gap-2">
                      {getSkillStatus(selectedSkill) === 'unlocked' ? t.installed : t.unlock}
                      {getSkillStatus(selectedSkill) === 'available' && <Check size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                   </span>
                </button>
             </div>
           </>
         ) : (
           <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-slate-800 flex items-center justify-center animate-pulse">
                  <MousePointer2 size={32} className="opacity-50" />
              </div>
              <p className="text-center text-xs font-mono uppercase tracking-[0.2em] px-8 leading-relaxed opacity-60">
                 Select a neural node<br/>to inspect parameters
              </p>
           </div>
         )}
      </div>
      
      {/* Global Styles for Dash Animation (Injected) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash {
           animation: dash 1s linear infinite;
        }
      `}} />
    </div>
  );
};

export default SkillTreeModal;