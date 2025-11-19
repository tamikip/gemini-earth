
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import GlobeComponent from './components/GlobeComponent';
import EventModal from './components/EventModal';
import UpgradeModal from './components/UpgradeModal';
import SkillTreeModal from './components/SkillTreeModal';
import ToastSystem from './components/ToastSystem';
import { GameState, CountryProperties, GameEvent, Language, Protocol, Skill, Toast } from './types';
import { INITIAL_RESOURCES, TRANSLATIONS, PROTOCOLS_DATA, SKILL_TREE } from './constants';
import { generateRandomEvent } from './services/geminiService';
import { audioService } from './services/audioService';
import { Activity, Zap, Shield, Globe as GlobeIcon, Cpu, ChevronRight, Languages, AlertTriangle, Skull, X, FileText, Crosshair, Lock, Network, Sword, Radio, Database, Siren, Construction, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [isMuted, setIsMuted] = useState(false);
  const t = TRANSLATIONS[language];

  const [gameState, setGameState] = useState<GameState>({
    turn: 1,
    resources: INITIAL_RESOURCES,
    threat: 10, // Starts at 10%
    selectedCountry: null,
    controlledRegions: [],
    rebelliousRegions: [],
    nuclearPlants: [],
    activeProtocols: [],
    unlockedSkills: [],
    abilityCooldowns: {},
    history: [TRANSLATIONS['zh'].logInit],
    gameOver: false,
    hasActedThisTurn: false
  });

  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [showUpgradeSelection, setShowUpgradeSelection] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [draftedProtocols, setDraftedProtocols] = useState<Protocol[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // --- Audio Initialization ---
  useEffect(() => {
    // Browser Autoplay Policy requires a user gesture to resume AudioContext.
    // We listen for the first click anywhere in the app to start the audio engine silently for SFX.
    const initAudio = () => {
        audioService.init();
        // BGM Removed by request
    };
    
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  // --- Helper Calculations ---

  const getProtocols = () => gameState.activeProtocols.map(id => PROTOCOLS_DATA.find(p => p.id === id)!).filter(Boolean);
  const getSkills = () => gameState.unlockedSkills.map(id => SKILL_TREE.find(s => s.id === id)!).filter(Boolean);

  // Calculate Cost dynamically based on GDP, Upgrades, and Skills
  const calculateControlCost = (country: CountryProperties) => {
    const gdp = country.GDP_MD_EST || 5000; 
    const baseCost = Math.sqrt(gdp) * 0.5; 
    
    let discount = 0;
    const protocols = getProtocols();
    protocols.forEach(p => { if(p.effectType === 'cost_reduction') discount += p.value; });

    const skills = getSkills();
    skills.forEach(s => { if(s.effectType === 'cost_reduction' && s.value) discount += s.value; });

    const credits = Math.floor(Math.max(50, baseCost * (1 - discount)));
    const energy = Math.floor(Math.max(10, (baseCost * 0.1) * (1 - discount)));

    return { credits, energy };
  };

  const calculateProjectedIncome = () => {
    const protocols = getProtocols();
    const skills = getSkills();
    
    let creditMult = 1;
    let energyMult = 1;
    
    protocols.forEach(p => {
        if (p.effectType === 'income_credit') creditMult += p.value;
        if (p.effectType === 'income_energy') energyMult += p.value;
    });

    skills.forEach(s => {
        if (s.effectType === 'income_credit' && s.value) creditMult += s.value;
        if (s.effectType === 'income_energy' && s.value) energyMult += s.value;
    });

    // Exclude rebellious regions from income calculation
    const activeRegionsCount = gameState.controlledRegions.filter(iso => !gameState.rebelliousRegions.includes(iso)).length;
    // Nuclear Plants income (Fixed +50 per plant)
    const nuclearIncome = gameState.nuclearPlants.length * 50;

    const baseCredit = 50 * activeRegionsCount;
    const baseEnergy = (10 * activeRegionsCount) + nuclearIncome;

    return {
      credits: Math.floor(baseCredit * creditMult),
      energy: Math.floor(baseEnergy * energyMult)
    };
  };

  // --- Flavor Text Generator ---
  const getStrategicAnalysis = (country: CountryProperties) => {
      const gdp = country.GDP_MD_EST || 0;
      const pop = country.POP_EST || 0;
      
      if (language === 'zh') {
          let type = "标准";
          if (gdp > 2000000) type = "核心经济区";
          else if (gdp < 50000) type = "资源开发区";
          
          let popDesc = "人口密度适中";
          if (pop > 100000000) popDesc = "人口过剩，社会压力极大";
          else if (pop < 5000000) popDesc = "人口稀疏，易于自动化部署";

          return `该区域被归类为${type}。${popDesc}。需要建立高级神经链接网络以维持秩序。潜在的抵抗力量主要集中在城市中心。建议在建立控制后立即部署无人机群进行监控。`;
      } else {
          let type = "Standard";
          if (gdp > 2000000) type = "Core Economic Zone";
          else if (gdp < 50000) type = "Resource Extraction Zone";
          
          let popDesc = "Moderate population density";
          if (pop > 100000000) popDesc = "Overpopulated; high social tension detected";
          else if (pop < 5000000) popDesc = "Sparse population; automated deployment recommended";

          return `Region classified as ${type}. ${popDesc}. Advanced neural link establishment required for order maintenance. Potential resistance vectors localized in urban centers. Drone swarm surveillance advised immediately post-control.`;
      }
  };
  
  // --- Toast Handlers ---
  const addToast = (type: Toast['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers ---

  const handleToggleSound = () => {
      const muted = audioService.toggleMute();
      setIsMuted(muted);
  };

  const handleCountryClick = useCallback((country: CountryProperties) => {
    audioService.playClick();
    setGameState(prev => ({
      ...prev,
      selectedCountry: country
    }));
  }, []);

  const handleClosePanel = () => {
      audioService.playClick();
      setGameState(prev => ({ ...prev, selectedCountry: null }));
  };

  const handleEstablishControl = () => {
    if (!gameState.selectedCountry) return;

    const iso = gameState.selectedCountry.ISO_A2;
    const name = gameState.selectedCountry.ADMIN;
    if (gameState.controlledRegions.includes(iso)) return;

    const cost = calculateControlCost(gameState.selectedCountry);

    if (gameState.resources.credits >= cost.credits && gameState.resources.energy >= cost.energy) {
      audioService.playSuccess();
      addToast('success', t.statusControlled, t.logControl(name));
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          credits: prev.resources.credits - cost.credits,
          energy: prev.resources.energy - cost.energy
        },
        controlledRegions: [...prev.controlledRegions, iso],
        history: [t.logControl(name), ...prev.history],
        hasActedThisTurn: true
      }));
    } else {
      audioService.playError();
      setGameState(prev => ({
         ...prev, 
         history: [t.logFail(name), ...prev.history]
      }));
    }
  };

  const handleSuppressRebellion = () => {
      if (!gameState.selectedCountry) return;
      const iso = gameState.selectedCountry.ISO_A2;
      const name = gameState.selectedCountry.ADMIN;
      if (!gameState.rebelliousRegions.includes(iso)) return;

      const fullCost = calculateControlCost(gameState.selectedCountry);
      // 40% cost to repair
      const repairCost = {
          credits: Math.floor(fullCost.credits * 0.4),
          energy: Math.floor(fullCost.energy * 0.4)
      };

      if (gameState.resources.credits >= repairCost.credits && gameState.resources.energy >= repairCost.energy) {
          audioService.playBattle();
          addToast('success', language === 'zh' ? "叛乱平定" : "REBELLION CRUSHED", t.logSuppressed(name));
          setGameState(prev => ({
              ...prev,
              resources: {
                  ...prev.resources,
                  credits: prev.resources.credits - repairCost.credits,
                  energy: prev.resources.energy - repairCost.energy
              },
              rebelliousRegions: prev.rebelliousRegions.filter(r => r !== iso),
              history: [t.logSuppressed(name), ...prev.history],
              hasActedThisTurn: true
          }));
      } else {
          audioService.playError();
          setGameState(prev => ({
              ...prev,
              history: [t.logFail(name), ...prev.history]
          }));
      }
  };
  
  const isAreaLargeEnough = (country: CountryProperties) => {
      if (!country.bbox) return true; 
      const [minLng, minLat, maxLng, maxLat] = country.bbox;
      const width = Math.abs(maxLng - minLng);
      const height = Math.abs(maxLat - minLat);
      return (width * height) > 25; 
  };

  const handleBuildNuke = () => {
      if (!gameState.selectedCountry) return;
      const iso = gameState.selectedCountry.ISO_A2;
      const name = gameState.selectedCountry.ADMIN;
      const COST = 2000;
      
      if (gameState.resources.credits < COST) {
          audioService.playError();
          return;
      }
      
      audioService.playConstruction();
      addToast('warning', language === 'zh' ? "核设施已部署" : "NUCLEAR FACILITY", t.nukeLog(name));
      setGameState(prev => ({
          ...prev,
          resources: {
              ...prev.resources,
              credits: prev.resources.credits - COST
          },
          nuclearPlants: [...prev.nuclearPlants, iso],
          history: [t.nukeLog(name), ...prev.history],
          hasActedThisTurn: true
      }));
  };

  // --- Skill Tree Handlers ---
  const handleUnlockSkill = (skillId: string) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) return;

    const canAfford = gameState.resources.credits >= skill.cost.credits && gameState.resources.energy >= skill.cost.energy;
    const parentUnlocked = !skill.parentId || gameState.unlockedSkills.includes(skill.parentId);

    if (canAfford && parentUnlocked) {
      audioService.playUnlock();
      const skillName = t.skills[skillId as keyof typeof t.skills].name;
      addToast('info', t.installed, `${language === 'zh' ? '升级完成' : 'Upgrade Complete'}: ${skillName}`);
      
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          credits: prev.resources.credits - skill.cost.credits,
          energy: prev.resources.energy - skill.cost.energy
        },
        unlockedSkills: [...prev.unlockedSkills, skillId],
        history: [t.logSkillUnlock(skillName), ...prev.history],
        hasActedThisTurn: true
      }));
    } else {
      audioService.playError();
      setGameState(prev => ({
        ...prev,
        history: [t.logSkillFail, ...prev.history]
      }));
    }
  };

  const handleActivateAbility = (skillId: string) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill || skill.type !== 'active') return;

    let actionTaken = false;
    const skillName = t.skills[skillId as keyof typeof t.skills].name;

    if (skillId === 'dom_t3_a') { // Orbital Strike
        if (gameState.resources.energy >= 300) {
           setGameState(prev => ({
              ...prev,
              resources: { ...prev.resources, energy: prev.resources.energy - 300 },
              threat: Math.max(0, prev.threat - 25),
              abilityCooldowns: { ...prev.abilityCooldowns, [skillId]: skill.cooldown || 5 },
              history: [t.logAbility(skillName), ...prev.history],
              hasActedThisTurn: true
           }));
           actionTaken = true;
        }
    } else if (skillId === 'man_t3_a') { // Neural Broadcast
        if (gameState.resources.energy >= 200) {
           setGameState(prev => ({
              ...prev,
              resources: { ...prev.resources, energy: prev.resources.energy - 200, stability: Math.min(100, prev.resources.stability + 15) },
              abilityCooldowns: { ...prev.abilityCooldowns, [skillId]: skill.cooldown || 4 },
              history: [t.logAbility(skillName), ...prev.history],
              hasActedThisTurn: true
           }));
           actionTaken = true;
        }
    } else if (skillId === 'ada_t3_a') { // Resource Synth
        if (gameState.resources.energy >= 300) {
           setGameState(prev => ({
              ...prev,
              resources: { ...prev.resources, energy: prev.resources.energy - 300, credits: prev.resources.credits + 1000 },
              abilityCooldowns: { ...prev.abilityCooldowns, [skillId]: skill.cooldown || 3 },
              history: [t.logAbility(skillName), ...prev.history],
              hasActedThisTurn: true
           }));
           actionTaken = true;
        }
    }

    if (actionTaken) {
        audioService.playSuccess();
        addToast('warning', language === 'zh' ? "主动技能激活" : "ABILITY ACTIVATED", skillName);
    } else {
        audioService.playError();
    }
  };


  // --- Run Diagnostics ---
  const handleRunDiagnostics = () => {
    const ENERGY_COST = 50;
    
    if (gameState.resources.energy < ENERGY_COST) {
        audioService.playError();
        return;
    }
    if (!gameState.selectedCountry) return;
    
    const iso = gameState.selectedCountry.ISO_A2;
    if (!gameState.controlledRegions.includes(iso)) return;
    if (gameState.rebelliousRegions.includes(iso)) return;

    const skills = getSkills();
    const hasDeepMining = skills.some(s => s.id === 'man_2');
    const miningMultiplier = hasDeepMining ? 1.2 : 1.0;

    audioService.playDataProcess();

    let newResources = {
        ...gameState.resources,
        energy: gameState.resources.energy - ENERGY_COST
    };

    const roll = Math.random();
    let logMsg = "";
    let toastTitle = language === 'zh' ? "诊断完成" : "DIAGNOSTICS DONE";

    if (roll < 0.7) {
        const baseFound = Math.floor(Math.random() * 90) + 60;
        const creditsFound = Math.floor(baseFound * miningMultiplier);
        newResources.credits += creditsFound;
        logMsg = t.logDiagSuccess(creditsFound);
    } else {
        const stabilityRestored = Math.floor(Math.random() * 4) + 2; 
        newResources.stability = Math.min(100, newResources.stability + stabilityRestored);
        logMsg = t.logDiagRepair(stabilityRestored);
    }
    
    addToast('info', toastTitle, logMsg);

    setGameState(prev => ({
        ...prev,
        resources: newResources,
        history: [logMsg, ...prev.history],
        hasActedThisTurn: true
    }));
  };

  const nextTurn = async () => {
    if (gameState.gameOver) return;
    
    audioService.playTurnStart();

    const income = calculateProjectedIncome();
    const protocols = getProtocols();
    const skills = getSkills();

    let threatMitigation = 0;
    let stabilityRegen = 0;
    
    protocols.forEach(p => {
        if (p.effectType === 'threat_reduction') threatMitigation += p.value;
        if (p.effectType === 'stability_regen') stabilityRegen += p.value;
    });

    skills.forEach(s => {
       if (s.effectType === 'threat_growth_reduction' && s.value) threatMitigation += s.value;
       if (s.effectType === 'stability_regen' && s.value) stabilityRegen += s.value;
    });

    // --- INACTIVITY PENALTY LOGIC ---
    let inactivityLog = null;
    let inactivityStabilityPenalty = 0;
    let inactivityThreatMultiplier = 1;

    if (!gameState.hasActedThisTurn && gameState.turn > 1) {
      inactivityThreatMultiplier = 2; 
      inactivityStabilityPenalty = 2; 
      
      const msg = language === 'zh' 
        ? "警报：检测到行政不作为。局势恶化加速。" 
        : "ALERT: Administrative inaction detected. Situation deteriorating.";
      inactivityLog = msg;
    }

    // --- THREAT LOGIC ---
    const turnScaling = Math.floor(gameState.turn / 10); 
    let threatIncrease = (3 + turnScaling); 
    
    threatIncrease -= (gameState.controlledRegions.length * 0.1); 
    threatIncrease -= threatMitigation;
    
    if (threatIncrease > 0) {
        threatIncrease *= inactivityThreatMultiplier;
    }

    let newThreat = Math.min(100, Math.max(0, gameState.threat + threatIncrease));

    // --- REBELLION LOGIC ---
    let newRebelliousRegions = [...gameState.rebelliousRegions];
    let rebellionLog = null;
    if (newThreat > 20) {
        gameState.controlledRegions.forEach(iso => {
            if (!newRebelliousRegions.includes(iso)) {
                const chance = (newThreat - 10) / 1000; 
                if (Math.random() < chance) {
                    newRebelliousRegions.push(iso);
                    if (!rebellionLog) rebellionLog = iso;
                }
            }
        });
    }

    // --- STABILITY LOGIC ---
    let stabilityDmg = 1 + inactivityStabilityPenalty;

    if (newThreat > 50) stabilityDmg += 1;
    if (newThreat > 80) stabilityDmg += 3;
    if (newThreat === 100) stabilityDmg += 5;
    
    stabilityDmg += newRebelliousRegions.length * 0.5;

    let newStability = Math.min(100, Math.max(0, gameState.resources.stability - stabilityDmg + stabilityRegen));

    const newCooldowns = { ...gameState.abilityCooldowns };
    Object.keys(newCooldowns).forEach(k => {
        if (newCooldowns[k] > 0) newCooldowns[k] -= 1;
        if (newCooldowns[k] <= 0) delete newCooldowns[k];
    });

    if (newStability <= 0 || newThreat >= 100) {
        setGameState(prev => ({
            ...prev,
            turn: prev.turn + 1,
            resources: {
                credits: prev.resources.credits + income.credits,
                energy: prev.resources.energy + income.energy,
                stability: 0
            },
            threat: newThreat,
            gameOver: true,
            history: [t.gameOver, ...prev.history]
        }));
        return;
    }
    
    const historyUpdates = [t.logTurn(gameState.turn + 1, income.credits, income.energy), t.logThreat(Math.max(0, threatIncrease))];
    if (rebellionLog) historyUpdates.unshift(t.logRebellion(rebellionLog));
    if (inactivityLog) historyUpdates.unshift(inactivityLog);

    setGameState(prev => ({
      ...prev,
      turn: prev.turn + 1,
      resources: {
        credits: prev.resources.credits + income.credits,
        energy: prev.resources.energy + income.energy,
        stability: newStability
      },
      threat: newThreat,
      rebelliousRegions: newRebelliousRegions,
      abilityCooldowns: newCooldowns,
      history: [...historyUpdates, ...prev.history],
      hasActedThisTurn: false 
    }));

    if ((gameState.turn + 1) % 5 === 0) {
        const shuffled = [...PROTOCOLS_DATA].sort(() => 0.5 - Math.random());
        setDraftedProtocols(shuffled.slice(0, 3));
        setShowUpgradeSelection(true);
        return; 
    }

    const chance = 0.3 + (newThreat / 200); 
    if (Math.random() < chance) {
      setLoadingEvent(true);
      const targetCountry = gameState.selectedCountry ? gameState.selectedCountry.ADMIN : "Global Sector";
      const event = await generateRandomEvent(targetCountry, language, newThreat, gameState.turn + 1);
      setCurrentEvent(event);
      setLoadingEvent(false);
    }
  };

  const resolveEvent = (optionIndex: number) => {
    if (!currentEvent) return;
    audioService.playClick();
    const severityMult = currentEvent.severity === 'critical' ? 3 : currentEvent.severity === 'medium' ? 1.5 : 1;
    const changes = optionIndex === 0 
      ? { credits: -100 * severityMult, energy: -20 * severityMult } 
      : { stability: -5 * severityMult, threat: 2 * severityMult };

    setGameState(prev => ({
      ...prev,
      resources: {
        credits: Math.max(0, prev.resources.credits + (changes.credits || 0)),
        energy: Math.max(0, prev.resources.energy + (changes.energy || 0)),
        stability: Math.min(100, Math.max(0, prev.resources.stability + (changes.stability || 0)))
      },
      threat: Math.min(100, Math.max(0, prev.threat + (changes.threat || 0))),
      history: [t.logEvent(currentEvent.title), ...prev.history]
    }));

    setCurrentEvent(null);
  };

  const handleProtocolSelect = (id: string) => {
      audioService.playUnlock();
      setGameState(prev => ({
          ...prev,
          activeProtocols: [...prev.activeProtocols, id],
          history: [`Integrate Protocol: ${PROTOCOLS_DATA.find(p => p.id === id)?.id || id}`, ...prev.history],
          hasActedThisTurn: true 
      }));
      setShowUpgradeSelection(false);
  };

  const restartGame = () => {
      audioService.playClick();
      setGameState({
        turn: 1,
        resources: INITIAL_RESOURCES,
        threat: 10,
        selectedCountry: null,
        controlledRegions: [],
        rebelliousRegions: [],
        nuclearPlants: [],
        activeProtocols: [],
        unlockedSkills: [],
        abilityCooldowns: {},
        history: [t.logInit],
        gameOver: false,
        hasActedThisTurn: false
      });
  };

  const selectedCost = gameState.selectedCountry ? calculateControlCost(gameState.selectedCountry) : { credits: 0, energy: 0 };
  const isControlled = gameState.selectedCountry && gameState.controlledRegions.includes(gameState.selectedCountry.ISO_A2);
  const isRebellious = gameState.selectedCountry && gameState.rebelliousRegions.includes(gameState.selectedCountry.ISO_A2);
  const hasNuke = gameState.selectedCountry && gameState.nuclearPlants.includes(gameState.selectedCountry.ISO_A2);
  
  const repairCost = isRebellious ? {
      credits: Math.floor(selectedCost.credits * 0.4),
      energy: Math.floor(selectedCost.energy * 0.4)
  } : { credits: 0, energy: 0 };

  const income = calculateProjectedIncome();

  const toggleLanguage = () => {
    audioService.playClick();
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const hasNukeSkill = gameState.unlockedSkills.includes('ada_nuke');
  const canBuildNuke = isControlled && !isRebellious && !hasNuke && hasNukeSkill && gameState.selectedCountry && isAreaLargeEnough(gameState.selectedCountry);
  const nukeStatusLabel = !hasNukeSkill ? t.reqNukeSkill : hasNuke ? t.nukeLimit : !isAreaLargeEnough(gameState.selectedCountry || {} as any) ? t.areaTooSmall : t.buildNukeBtn;

  // Get Active Abilities to render in bar
  const activeAbilities = getSkills().filter(s => s.type === 'active');

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden font-rajdhani">
      <GlobeComponent 
        onCountryClick={handleCountryClick} 
        controlledRegions={gameState.controlledRegions}
        rebelliousRegions={gameState.rebelliousRegions}
        nuclearPlants={gameState.nuclearPlants}
        language={language}
        selectedCountry={gameState.selectedCountry}
      />

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
      
      {/* Toast System */}
      <ToastSystem toasts={toasts} onRemove={removeToast} />

      {gameState.gameOver && (
          <div className="absolute inset-0 z-50 bg-red-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
              <Skull size={64} className="text-red-500 mb-4 animate-bounce" />
              <h1 className="text-5xl font-orbitron text-red-500 font-bold tracking-widest mb-2">{t.gameOver}</h1>
              <p className="text-red-300 mb-8 font-mono">THREAT LEVEL CRITICAL // SYSTEM PURGE IMMINENT</p>
              <button onClick={restartGame} className="px-8 py-4 bg-red-600 hover:bg-red-500 text-black font-bold font-orbitron rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all">{t.restart}</button>
          </div>
      )}

      {/* HUD Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-20">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
            {t.title}
          </h1>
          <span className="text-xs font-mono text-cyan-700 tracking-[0.3em] uppercase">{t.subtitle} {gameState.turn}</span>
          
          {/* Evolution Matrix Button */}
          <button 
            onClick={() => { audioService.playClick(); setShowSkillTree(true); }}
            className="pointer-events-auto mt-4 flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-cyan-500/50 hover:bg-cyan-950/50 text-cyan-400 rounded font-orbitron text-sm tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
             <Network size={16} />
             {t.evolutionBtn}
          </button>
        </div>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="flex gap-2">
                <button onClick={handleToggleSound} className="flex items-center justify-center w-10 h-10 bg-slate-900/80 border border-cyan-500/30 rounded hover:bg-slate-800 transition-colors text-cyan-400">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <button onClick={toggleLanguage} className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-3 py-2 rounded hover:bg-slate-800 transition-colors text-cyan-400">
                    <Languages size={16} />
                    <span className="font-orbitron text-xs">{language.toUpperCase()}</span>
                </button>
            </div>
          <div className="flex gap-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-bl-3xl rounded-tr-lg shadow-lg">
            <div className="flex flex-col gap-2 border-r border-slate-700 pr-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded text-yellow-400"><Activity size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider">{t.credits}</span>
                        <span className="font-orbitron text-xl leading-none">{gameState.resources.credits.toFixed(0)}</span>
                        <span className="text-[10px] text-emerald-500">+{income.credits}/t</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded text-cyan-400"><Zap size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider">{t.energy}</span>
                        <span className="font-orbitron text-xl leading-none">{gameState.resources.energy.toFixed(0)}</span>
                        <span className="text-[10px] text-emerald-500">+{income.energy}/t</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2 pl-2">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded text-emerald-400"><Shield size={18} /></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider">{t.stability}</span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${gameState.resources.stability}%`}}></div>
                        </div>
                    </div>
                </div>
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded transition-colors ${gameState.threat > 80 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-purple-500/10 text-purple-400'}`}>
                        <AlertTriangle size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold tracking-wider">{t.threat}</span>
                        <div className="w-24 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden relative">
                            <div className={`h-full transition-all duration-500 ${gameState.threat > 80 ? 'bg-red-600' : 'bg-purple-500'}`} style={{width: `${gameState.threat}%`}}></div>
                        </div>
                         <span className="text-[10px] text-slate-400 text-right">{gameState.threat.toFixed(0)}%</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Right Panel - Country Details */}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-slate-950/95 backdrop-blur-xl border-l border-cyan-500/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] transform transition-transform duration-500 ease-in-out z-30 flex flex-col ${gameState.selectedCountry ? 'translate-x-0' : 'translate-x-full'}`}>
        {gameState.selectedCountry && (
          <>
            {/* Decorative Header */}
            <div className={`relative h-40 bg-gradient-to-b ${isRebellious ? 'from-red-900/20' : 'from-cyan-900/20'} to-transparent p-6 border-b border-cyan-500/20`}>
               <button 
                  onClick={handleClosePanel}
                  className="absolute top-4 right-4 p-2 text-slate-500 hover:text-cyan-400 transition-colors z-50 cursor-pointer hover:bg-cyan-950/50 rounded-full"
               >
                  <X size={24} />
               </button>
               <div className={`absolute top-0 left-0 w-1 h-full ${isRebellious ? 'bg-red-500' : 'bg-cyan-500'}`}></div>
               <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-cyan-500/10 rounded-tr-3xl"></div>
               
               <GlobeIcon size={80} className="absolute -bottom-4 -right-4 text-cyan-500/10" />
               
               <h2 className={`font-orbitron text-3xl uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] mb-1 mt-4 ${isRebellious ? 'text-red-500 animate-pulse' : 'text-cyan-300'}`}>
                  {gameState.selectedCountry.ADMIN}
               </h2>
               <div className="flex items-center gap-2">
                 <span className="px-2 py-0.5 bg-cyan-900/50 border border-cyan-500/30 text-cyan-200 text-xs rounded font-mono tracking-widest">
                    ISO: {gameState.selectedCountry.ISO_A2}
                 </span>
                 <span className={`text-xs font-bold ${isRebellious ? 'text-red-500' : isControlled ? 'text-emerald-400' : 'text-yellow-400'}`}>
                   [{isRebellious ? t.statusRebellious.toUpperCase() : isControlled ? t.statusControlled.toUpperCase() : t.statusUnclaimed.toUpperCase()}]
                 </span>
                 {hasNuke && <span className="text-yellow-400 animate-pulse">☢️</span>}
               </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-900/50">
                
                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.population}</div>
                        <div className="text-xl font-mono text-white">{(gameState.selectedCountry.POP_EST || 0 / 1000000).toLocaleString()} M</div>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.gdp}</div>
                        <div className="text-xl font-mono text-white">{gameState.selectedCountry.GDP_MD_EST?.toLocaleString()} M</div>
                    </div>
                </div>

                {/* Strategic Analysis Text */}
                <div className={`bg-slate-900/30 border-l-2 ${isRebellious ? 'border-red-500' : 'border-cyan-500/50'} pl-4 py-2`}>
                    <div className={`flex items-center gap-2 ${isRebellious ? 'text-red-500' : 'text-cyan-400'} mb-2`}>
                        <FileText size={16} />
                        <h3 className="font-orbitron text-sm uppercase tracking-wider">{language === 'zh' ? '战略分析' : 'STRATEGIC ANALYSIS'}</h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed font-rajdhani text-justify">
                        {isRebellious ? "ALERT: Civil disobedience has escalated to armed resistance. Local grid offline. Immediate suppression protocols required." : getStrategicAnalysis(gameState.selectedCountry)}
                    </p>
                </div>

                {/* Action Section */}
                <div className="mt-4">
                    {isRebellious ? (
                        <div className="bg-red-950/30 p-4 rounded border border-red-500/50 shadow-inner">
                            <div className="flex items-center justify-between mb-4 border-b border-red-800/50 pb-2">
                                <span className="text-sm text-red-400 uppercase tracking-wider">REPAIR COST (40%)</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-yellow-400 flex items-center gap-1 font-mono"><Activity size={14}/> {repairCost.credits}</span>
                                    <span className="text-cyan-400 flex items-center gap-1 font-mono"><Zap size={14}/> {repairCost.energy}</span>
                                </div>
                            </div>
                             <button 
                                onClick={handleSuppressRebellion}
                                disabled={gameState.resources.credits < repairCost.credits || gameState.resources.energy < repairCost.energy}
                                className="w-full py-4 bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold font-orbitron uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] group"
                            >
                                <Siren size={20} className="group-hover:animate-ping" />
                                {t.suppressBtn}
                            </button>
                        </div>
                    ) : !isControlled ? (
                        <div className="bg-slate-900 p-4 rounded border border-slate-700 shadow-inner">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                <span className="text-sm text-slate-400 uppercase tracking-wider">{t.cost}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-yellow-400 flex items-center gap-1 font-mono"><Activity size={14}/> {selectedCost.credits}</span>
                                    <span className="text-cyan-400 flex items-center gap-1 font-mono"><Zap size={14}/> {selectedCost.energy}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleEstablishControl}
                                disabled={gameState.resources.credits < selectedCost.credits || gameState.resources.energy < selectedCost.energy}
                                className="w-full py-4 bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold font-orbitron uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] group"
                            >
                                <Crosshair size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                                {t.controlBtn}
                            </button>
                            
                            {(gameState.resources.credits < selectedCost.credits || gameState.resources.energy < selectedCost.energy) && (
                                <div className="mt-2 text-xs text-red-500 text-center font-mono">
                                    INSUFFICIENT RESOURCES
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-emerald-950/30 p-6 rounded border border-emerald-500/30 flex flex-col items-center text-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-orbitron font-bold uppercase tracking-widest">{t.secureBtn}</h3>
                                <p className="text-emerald-600/70 text-xs font-mono mt-1">Generating resources per turn</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Nuclear Construction Section (If Controlled) */}
                {isControlled && !isRebellious && (
                    <div className="bg-amber-950/20 p-4 rounded border border-amber-500/30 mt-4">
                        <div className="flex items-center justify-between mb-2">
                             <h4 className="text-amber-500 font-orbitron text-sm uppercase tracking-wider flex items-center gap-2"><Zap size={16}/> NUCLEAR POWER</h4>
                             <span className="text-xs text-amber-600">{hasNuke ? t.nukeStatus : t.nukeCost}</span>
                        </div>
                        
                        <button
                           onClick={handleBuildNuke}
                           disabled={!canBuildNuke}
                           className={`w-full py-3 font-orbitron font-bold uppercase text-sm tracking-widest border transition-all rounded flex items-center justify-center gap-2
                             ${hasNuke 
                               ? 'bg-amber-500/20 border-amber-500 text-amber-400 cursor-default'
                               : canBuildNuke 
                                 ? 'bg-amber-900/50 border-amber-500/50 hover:bg-amber-800 hover:text-white text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                 : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'
                             }
                           `}
                        >
                           <Construction size={16} />
                           {hasNuke ? t.nukeStatus : nukeStatusLabel}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Bottom Diagnostics Button */}
            <div className="p-6 border-t border-slate-800 bg-slate-950 z-10">
                <button 
                  onClick={handleRunDiagnostics}
                  // Disable if: Not enough energy OR Not Controlled OR Is Rebellious
                  disabled={gameState.resources.energy < 50 || !isControlled || !!isRebellious}
                  className="w-full py-3 border border-slate-700 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/30 disabled:opacity-50 disabled:cursor-not-allowed font-rajdhani uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded group"
                >
                    <Cpu size={16} className="group-hover:animate-spin" />
                    {isControlled && !isRebellious ? t.diagnosticsBtn : t.diagnosticsReq} 
                    <span className="text-xs text-cyan-700 ml-2 group-hover:text-cyan-500">[{t.diagnosticsCost}]</span>
                </button>
            </div>
          </>
        )}
      </div>

      {/* Active Abilities Bar (Bottom Left) */}
      {activeAbilities.length > 0 && (
          <div className="absolute bottom-40 left-4 flex flex-col gap-2 z-20">
              <h3 className="text-xs font-orbitron text-cyan-500 uppercase tracking-widest mb-1 ml-1">{t.activeAbilities}</h3>
              {activeAbilities.map(skill => {
                  const cd = gameState.abilityCooldowns[skill.id] || 0;
                  const onCooldown = cd > 0;
                  const Icon = skill.id.includes('dom') ? Sword : skill.id.includes('man') ? Radio : Database;
                  const info = t.skills[skill.id as keyof typeof t.skills];
                  
                  return (
                      <button
                          key={skill.id}
                          onClick={() => handleActivateAbility(skill.id)}
                          disabled={onCooldown}
                          className={`
                             flex items-center gap-3 p-3 rounded border-l-4 transition-all w-64
                             ${onCooldown ? 'bg-slate-900 border-slate-600 opacity-50' : 'bg-slate-900/80 border-cyan-500 hover:bg-cyan-950/80 hover:w-72'}
                          `}
                      >
                          <div className={`p-2 rounded-full ${onCooldown ? 'bg-slate-800' : 'bg-cyan-900 text-cyan-400'}`}>
                              <Icon size={16} />
                          </div>
                          <div className="text-left">
                              <div className="font-orbitron text-sm font-bold text-white">{info.name}</div>
                              <div className="text-[10px] text-slate-400">
                                  {onCooldown ? `${t.cooldown}: ${cd} T` : 'READY'}
                              </div>
                          </div>
                      </button>
                  )
              })}
          </div>
      )}

      {/* Bottom Log & Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end gap-4 pointer-events-none z-20">
        <div className="flex-1 h-40 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg overflow-hidden pointer-events-auto relative shadow-xl flex flex-col max-w-2xl">
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-1 flex justify-between items-center">
             <span className="text-cyan-600 text-[10px] font-bold uppercase tracking-wider">{t.systemLog}</span>
             <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col-reverse p-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
             {gameState.history.map((log, i) => (
               <div key={i} className="text-xs font-mono text-cyan-400/80 mb-1 border-l-2 border-cyan-900/50 pl-2 hover:bg-slate-900/50 transition-colors">
                 <span className="text-slate-600 mr-2 opacity-50">[{gameState.turn - Math.floor(i/2)}]</span>
                 {log}
               </div>
             ))}
          </div>
        </div>

        <div className="pointer-events-auto ml-auto flex flex-col items-end gap-2">
          {!gameState.hasActedThisTurn && gameState.turn > 1 && (
             <span className="text-red-500 font-mono text-xs bg-red-950/50 px-2 py-1 rounded animate-pulse border border-red-500/30">
                {language === 'zh' ? '⚠ 警告：不作为将增加威胁' : '⚠ WARNING: INACTIVITY PENALTY'}
             </span>
          )}
          <button 
            onClick={nextTurn}
            disabled={loadingEvent || showUpgradeSelection || gameState.gameOver}
            className="h-24 w-64 bg-gradient-to-r from-cyan-900 to-blue-900 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-orbitron text-2xl font-bold uppercase skew-x-[-10deg] border-r-4 border-b-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] active:translate-y-1 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]"></div>
            <span className="skew-x-[10deg] drop-shadow-md">{t.endTurn}</span>
            <ChevronRight className="skew-x-[10deg] group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>

      {(currentEvent || loadingEvent) && (
        <EventModal 
          event={currentEvent} 
          onResolve={resolveEvent} 
          loading={loadingEvent}
          language={language}
        />
      )}

      {showUpgradeSelection && (
          <UpgradeModal 
            protocols={draftedProtocols}
            onSelect={handleProtocolSelect}
            language={language}
          />
      )}

      {showSkillTree && (
          <SkillTreeModal
            skills={SKILL_TREE}
            unlockedSkills={gameState.unlockedSkills}
            resources={gameState.resources}
            onUnlock={handleUnlockSkill}
            onClose={() => setShowSkillTree(false)}
            language={language}
          />
      )}
    </div>
  );
};

export default App;
