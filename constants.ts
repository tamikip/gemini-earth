
import { Language, Protocol, Skill } from "./types";

export const INITIAL_RESOURCES = {
  credits: 2000,
  energy: 500,
  stability: 100,
};

export const GEOJSON_URL = 'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';

// Roguelike Upgrades
export const PROTOCOLS_DATA: Protocol[] = [
  { id: 'eco_1', icon: 'Activity', rarity: 'common', effectType: 'income_credit', value: 0.2 },
  { id: 'eco_2', icon: 'Zap', rarity: 'common', effectType: 'income_energy', value: 0.2 },
  { id: 'def_1', icon: 'Shield', rarity: 'rare', effectType: 'stability_regen', value: 2 },
  { id: 'mil_1', icon: 'Crosshair', rarity: 'rare', effectType: 'cost_reduction', value: 0.15 },
  { id: 'net_1', icon: 'Wifi', rarity: 'common', effectType: 'threat_reduction', value: 1 }, 
  { id: 'ai_1', icon: 'Cpu', rarity: 'legendary', effectType: 'event_luck', value: 1 }, 
  { id: 'eco_3', icon: 'Gem', rarity: 'legendary', effectType: 'income_credit', value: 0.5 },
  { id: 'mil_2', icon: 'Orbit', rarity: 'legendary', effectType: 'cost_reduction', value: 0.3 },
];

// Evolution Matrix (Expanded Net-like Skill Tree)
// Coordinates: 0,0 is center. 
// Dominion (Red): Left (Negative X)
// Manipulation (Purple): Up (Negative Y)
// Adaptation (Green): Right (Positive X)

export const SKILL_TREE: Skill[] = [
  // --- DOMINION BRANCH (Military/Force) - Left Side ---
  { 
    id: 'dom_root', branch: 'dominion', tier: 1, icon: 'Crosshair', 
    position: { x: -100, y: 0 },
    cost: { credits: 800, energy: 100 }, parentId: null, 
    type: 'passive', effectType: 'cost_reduction', value: 0.05 
  },
  { 
    id: 'dom_t2_a', branch: 'dominion', tier: 2, icon: 'Shield', 
    position: { x: -200, y: -60 },
    cost: { credits: 1500, energy: 300 }, parentId: 'dom_root', 
    type: 'passive', effectType: 'stability_max', value: 10 
  },
  { 
    id: 'dom_t2_b', branch: 'dominion', tier: 2, icon: 'Swords', 
    position: { x: -200, y: 60 },
    cost: { credits: 1500, energy: 300 }, parentId: 'dom_root', 
    type: 'passive', effectType: 'cost_reduction', value: 0.10 
  },
  { 
    id: 'dom_t3_a', branch: 'dominion', tier: 3, icon: 'Zap', 
    position: { x: -300, y: -100 },
    cost: { credits: 3000, energy: 600 }, parentId: 'dom_t2_a', 
    type: 'active', cooldown: 5 // Orbital Strike (dom_active) logic in App
  },
  { 
    id: 'dom_t3_b', branch: 'dominion', tier: 3, icon: 'Lock', 
    position: { x: -300, y: 0 },
    cost: { credits: 2500, energy: 500 }, parentId: 'dom_t2_a', 
    type: 'passive', effectType: 'stability_regen', value: 2
  },
  { 
    id: 'dom_t3_c', branch: 'dominion', tier: 3, icon: 'Skull', 
    position: { x: -300, y: 100 },
    cost: { credits: 2500, energy: 500 }, parentId: 'dom_t2_b', 
    type: 'passive', effectType: 'threat_reduction', value: 2 // Passive threat slow
  },
  { 
    id: 'dom_t4_a', branch: 'dominion', tier: 4, icon: 'Orbit', 
    position: { x: -400, y: -50 },
    cost: { credits: 5000, energy: 1000 }, parentId: 'dom_t3_a', 
    type: 'passive', effectType: 'cost_reduction', value: 0.15 
  },
  { 
    id: 'dom_t4_b', branch: 'dominion', tier: 4, icon: 'Crosshair', 
    position: { x: -400, y: 50 },
    cost: { credits: 5000, energy: 1000 }, parentId: 'dom_t3_c', 
    type: 'passive', effectType: 'cost_reduction', value: 0.15 
  },
  { 
    id: 'dom_ult', branch: 'dominion', tier: 5, icon: 'Globe', 
    position: { x: -500, y: 0 },
    cost: { credits: 10000, energy: 5000 }, parentId: 'dom_t4_a', 
    type: 'passive', effectType: 'stability_regen', value: 5 
  },

  // --- MANIPULATION BRANCH (Control/Intel) - Top Side ---
  { 
    id: 'man_root', branch: 'manipulation', tier: 1, icon: 'Wifi', 
    position: { x: 0, y: -100 },
    cost: { credits: 600, energy: 200 }, parentId: null, 
    type: 'passive', effectType: 'threat_growth_reduction', value: 0.5 
  },
  { 
    id: 'man_t2_a', branch: 'manipulation', tier: 2, icon: 'Brain', 
    position: { x: -60, y: -200 },
    cost: { credits: 1200, energy: 400 }, parentId: 'man_root', 
    type: 'passive', effectType: 'intel_mining', value: 1.2 // Diagnostics buff
  },
  { 
    id: 'man_t2_b', branch: 'manipulation', tier: 2, icon: 'Radio', 
    position: { x: 60, y: -200 },
    cost: { credits: 1200, energy: 400 }, parentId: 'man_root', 
    type: 'passive', effectType: 'threat_growth_reduction', value: 0.5 
  },
  { 
    id: 'man_t3_a', branch: 'manipulation', tier: 3, icon: 'Radio', 
    position: { x: -100, y: -300 },
    cost: { credits: 3500, energy: 1000 }, parentId: 'man_t2_a', 
    type: 'active', cooldown: 4 // Neural Broadcast (man_active)
  },
  { 
    id: 'man_t3_b', branch: 'manipulation', tier: 3, icon: 'Lock', 
    position: { x: 0, y: -300 },
    cost: { credits: 2500, energy: 800 }, parentId: 'man_t2_a', 
    type: 'passive', effectType: 'intel_mining', value: 1.5 
  },
  { 
    id: 'man_t3_c', branch: 'manipulation', tier: 3, icon: 'Eye', 
    position: { x: 100, y: -300 },
    cost: { credits: 2500, energy: 800 }, parentId: 'man_t2_b', 
    type: 'passive', effectType: 'stability_regen', value: 1 
  },
  { 
    id: 'man_t4_a', branch: 'manipulation', tier: 4, icon: 'Cpu', 
    position: { x: -50, y: -400 },
    cost: { credits: 4500, energy: 1500 }, parentId: 'man_t3_a', 
    type: 'passive', effectType: 'threat_growth_reduction', value: 1.0 
  },
  { 
    id: 'man_t4_b', branch: 'manipulation', tier: 4, icon: 'Network', 
    position: { x: 50, y: -400 },
    cost: { credits: 4500, energy: 1500 }, parentId: 'man_t3_c', 
    type: 'passive', effectType: 'intel_mining', value: 2.0 
  },
  { 
    id: 'man_ult', branch: 'manipulation', tier: 5, icon: 'Ghost', 
    position: { x: 0, y: -500 },
    cost: { credits: 8000, energy: 4000 }, parentId: 'man_t4_b', 
    type: 'passive', effectType: 'stability_max', value: 50 
  },

  // --- ADAPTATION BRANCH (Economy/Tech) - Right Side ---
  { 
    id: 'ada_root', branch: 'adaptation', tier: 1, icon: 'Activity', 
    position: { x: 100, y: 0 },
    cost: { credits: 1000, energy: 0 }, parentId: null, 
    type: 'passive', effectType: 'income_credit', value: 0.1 
  },
  { 
    id: 'ada_t2_a', branch: 'adaptation', tier: 2, icon: 'Zap', 
    position: { x: 200, y: -60 },
    cost: { credits: 2000, energy: 200 }, parentId: 'ada_root', 
    type: 'passive', effectType: 'income_energy', value: 0.2 
  },
  { 
    id: 'ada_t2_b', branch: 'adaptation', tier: 2, icon: 'Gem', 
    position: { x: 200, y: 60 },
    cost: { credits: 2000, energy: 200 }, parentId: 'ada_root', 
    type: 'passive', effectType: 'income_credit', value: 0.2 
  },
  // New Nuke Skill
  {
    id: 'ada_nuke', branch: 'adaptation', tier: 3, icon: 'Zap',
    position: { x: 250, y: -150 },
    cost: { credits: 4000, energy: 800 }, parentId: 'ada_t2_a',
    type: 'passive', effectType: 'unlock_ability' // Unlocks building nukes
  },
  { 
    id: 'ada_t3_a', branch: 'adaptation', tier: 3, icon: 'Database', 
    position: { x: 300, y: -100 },
    cost: { credits: 4000, energy: 500 }, parentId: 'ada_t2_a', 
    type: 'active', cooldown: 3 // Resource Synth (ada_active)
  },
  { 
    id: 'ada_t3_b', branch: 'adaptation', tier: 3, icon: 'Shuffle', 
    position: { x: 300, y: 0 },
    cost: { credits: 3000, energy: 500 }, parentId: 'ada_t2_a', 
    type: 'passive', effectType: 'income_energy', value: 0.3 
  },
  { 
    id: 'ada_t3_c', branch: 'adaptation', tier: 3, icon: 'TrendingUp', 
    position: { x: 300, y: 100 },
    cost: { credits: 3000, energy: 500 }, parentId: 'ada_t2_b', 
    type: 'passive', effectType: 'income_credit', value: 0.3 
  },
  { 
    id: 'ada_t4_a', branch: 'adaptation', tier: 4, icon: 'Battery', 
    position: { x: 400, y: -50 },
    cost: { credits: 6000, energy: 1000 }, parentId: 'ada_t3_a', 
    type: 'passive', effectType: 'income_energy', value: 0.5 
  },
  { 
    id: 'ada_t4_b', branch: 'adaptation', tier: 4, icon: 'Server', 
    position: { x: 400, y: 50 },
    cost: { credits: 6000, energy: 1000 }, parentId: 'ada_t3_c', 
    type: 'passive', effectType: 'income_credit', value: 0.5 
  },
  { 
    id: 'ada_ult', branch: 'adaptation', tier: 5, icon: 'Sun', 
    position: { x: 500, y: 0 },
    cost: { credits: 12000, energy: 2000 }, parentId: 'ada_t4_a', 
    type: 'passive', effectType: 'income_credit', value: 1.0 
  },
];

export const SYSTEM_PROMPT = `
You are the AI Game Master for "Earth Dominion".
The player is a planetary AI Administrator.
Current Global Threat Level: {{THREAT}}% (0% is calm, 100% is apocalypse).
Current Turn: {{TURN}}.
Generate a sci-fi scenario for the country: {{COUNTRY}}.

If Threat is HIGH (>70%), generate riots, rebellions, or natural disasters.
If Threat is LOW (<30%), generate political disputes or tech discoveries.

Output strictly valid JSON:
{
  "title": "Short Event Title",
  "description": "2-3 sentences describing the situation.",
  "severity": "low" | "medium" | "critical",
  "options": [
    {
      "label": "Action Name",
      "description": "Description of action.",
      "effectDescription": "E.g. -100 Credits, +5 Threat"
    },
    {
      "label": "Alt Action",
      "description": "Description.",
      "effectDescription": "E.g. -50 Energy, -5 Stability"
    }
  ]
}
`;

export const TRANSLATIONS = {
  en: {
    title: "EARTH DOMINION",
    subtitle: "PROTOCOL: ACTIVE // TURN",
    credits: "CREDITS",
    energy: "ENERGY",
    stability: "STABILITY",
    threat: "GLOBAL THREAT",
    status: "Status:",
    statusControlled: "DOMINION ESTABLISHED",
    statusUnclaimed: "UNCLAIMED TERRITORY",
    statusRebellious: "REBELLION IN PROGRESS",
    population: "Population:",
    gdp: "GDP Output:",
    cost: "Control Cost:",
    income: "Est. Income:",
    controlBtn: "Establish Control",
    secureBtn: "Region Secure",
    suppressBtn: "Suppress Rebellion",
    diagnosticsBtn: "Run Diagnostics",
    diagnosticsCost: "-50 NRG",
    diagnosticsReq: "REQUIRES CONTROLLED REGION",
    evolutionBtn: "Evolution Matrix",
    systemLog: "SYSTEM LOG",
    endTurn: "End Turn",
    gameOver: "CRITICAL SYSTEM FAILURE",
    restart: "REBOOT SYSTEM",
    upgrades: "SELECT SYSTEM UPGRADE",
    upgradeDesc: "Select a new protocol to integrate into your core matrix.",
    skillTreeTitle: "EVOLUTION MATRIX",
    skillTreeDesc: "Navigate the neural net to unlock superior capabilities.",
    buildNukeBtn: "Construct Nuclear Plant",
    nukeCost: "Cost: 2000 CR",
    nukeStatus: "NUCLEAR FACILITY ONLINE",
    nukeLimit: "FACILITY EXISTS",
    areaTooSmall: "TERRITORY TOO SMALL",
    reqNukeSkill: "LOCKED: REQUIRES NUKE ENG.",
    nukeLog: (c: string) => `Nuclear Power Plant constructed in ${c}. +50 Energy/turn.`,
    logInit: "System initialized. Waiting for administrator input.",
    logControl: (country: string) => `Established control over ${country}.`,
    logFail: (country: string) => `Insufficient resources to control ${country}.`,
    logTurn: (t: number, c: number, e: number) => `Turn ${t} started. Income: +${c} CR, +${e} NRG.`,
    logEvent: (title: string) => `Resolved event: ${title}.`,
    logThreat: (val: number) => `Global Threat increased by ${val.toFixed(1)}%.`,
    logDiagSuccess: (cr: number) => `Diagnostics complete. Data mining yielded ${cr} Credits.`,
    logDiagRepair: (st: number) => `Diagnostics complete. Self-repair protocols restored ${st} Stability.`,
    logSkillUnlock: (name: string) => `Evolution complete: ${name} online.`,
    logSkillFail: "Insufficient resources or prerequisites not met.",
    logAbility: (name: string) => `Active Ability executed: ${name}.`,
    logRebellion: (c: string) => `ALERT: Rebellion detected in ${c}. Income suspended.`,
    logSuppressed: (c: string) => `Rebellion in ${c} suppressed. Control restored.`,
    activeAbilities: "ACTIVE SUBROUTINES",
    cooldown: "COOLDOWN",
    loadingTitle: "UPLINKING TO GEMINI AI...",
    loadingDesc: "Analyzing global threat vectors",
    actionRequired: "ACTION REQUIRED",
    effect: "EFFECT:",
    location: "Location:",
    language: "LANGUAGE",
    unlock: "INITIALIZE UPGRADE",
    installed: "INSTALLED",
    locked: "LOCKED",
    req: "REQ:",
    branches: {
      dominion: "DOMINION",
      manipulation: "MANIPULATION",
      adaptation: "ADAPTATION"
    },
    protocols: {
      eco_1: { name: "Quantum Banking", desc: "+20% Credit Income" },
      eco_2: { name: "Fusion Grid", desc: "+20% Energy Income" },
      def_1: { name: "Nano-Repair Swarm", desc: "+2 Stability Regen/Turn" },
      mil_1: { name: "Orbital Targeting", desc: "-15% Control Cost" },
      net_1: { name: "Propaganda Net", desc: "Slows Threat Growth" },
      ai_1: { name: "Predictive Alg.", desc: "Optimizes Event Outcomes" },
      eco_3: { name: "Dyson Swarm Link", desc: "+50% Credit Income" },
      mil_2: { name: "Rod from God", desc: "-30% Control Cost" },
    },
    skills: {
      dom_root: { name: "Kinetic Mapping", desc: "-5% Control Cost" },
      dom_t2_a: { name: "Iron Curtain", desc: "+10 Max Stability" },
      dom_t2_b: { name: "Blitz Tactics", desc: "-10% Control Cost" },
      dom_t3_a: { name: "Orbital Strike", desc: "ACT: -25 Threat. Cost: 300 NRG" },
      dom_t3_b: { name: "Auto-Turrets", desc: "+2 Stability Regen" },
      dom_t3_c: { name: "Fear Doctrine", desc: "Reduces Passive Threat Growth" },
      dom_t4_a: { name: "Sub-Orbital Drop", desc: "-15% Control Cost" },
      dom_t4_b: { name: "Pacification", desc: "-15% Control Cost" },
      dom_ult: { name: "Aegis System", desc: "+5 Stability Regen" },

      man_root: { name: "Memetic Eng.", desc: "Slows Threat Growth" },
      man_t2_a: { name: "Deep Mining", desc: "+20% Diagnostics Yield" },
      man_t2_b: { name: "Censorship Alg.", desc: "Slows Threat Growth" },
      man_t3_a: { name: "Neural Broadcast", desc: "ACT: +15 Stability. Cost: 200 NRG" },
      man_t3_b: { name: "Quantum Decrypt", desc: "+50% Diagnostics Yield" },
      man_t3_c: { name: "Panopticon", desc: "+1 Stability Regen" },
      man_t4_a: { name: "Thought Police", desc: "Greatly Slows Threat Growth" },
      man_t4_b: { name: "The All-Seeing", desc: "Double Diagnostics Yield" },
      man_ult: { name: "Hive Mind", desc: "+50 Max Stability" },

      ada_root: { name: "Auto-Trading", desc: "+10% Credit Income" },
      ada_t2_a: { name: "Superconductors", desc: "+20% Energy Income" },
      ada_t2_b: { name: "HFT Algo", desc: "+20% Credit Income" },
      ada_nuke: { name: "Nuclear Eng.", desc: "Can build Nuclear Plants (+Energy) in large regions." },
      ada_t3_a: { name: "Resource Synth", desc: "ACT: 300 NRG -> 1000 CR" },
      ada_t3_b: { name: "Cold Fusion", desc: "+30% Energy Income" },
      ada_t3_c: { name: "Market Manip.", desc: "+30% Credit Income" },
      ada_t4_a: { name: "Zero-Point Energy", desc: "+50% Energy Income" },
      ada_t4_b: { name: "Global Currency", desc: "+50% Credit Income" },
      ada_ult: { name: "Dyson Sphere", desc: "+100% Credit Income" },
    }
  },
  zh: {
    title: "地球统治协议",
    subtitle: "协议：激活 // 回合",
    credits: "信用点",
    energy: "能量",
    stability: "稳定性",
    threat: "全球威胁度",
    status: "状态：",
    statusControlled: "已建立统治",
    statusUnclaimed: "未占领区域",
    statusRebellious: "叛乱进行中",
    population: "人口：",
    gdp: "GDP 产出：",
    cost: "控制成本：",
    income: "预计收入：",
    controlBtn: "建立控制",
    secureBtn: "区域安全",
    suppressBtn: "镇压叛乱",
    diagnosticsBtn: "运行诊断",
    diagnosticsCost: "-50 能量",
    diagnosticsReq: "需要已控制区域",
    evolutionBtn: "进化矩阵",
    systemLog: "系统日志",
    endTurn: "结束回合",
    gameOver: "系统严重故障",
    restart: "重启系统",
    upgrades: "选择系统升级",
    upgradeDesc: "选择一个新的协议以集成到核心矩阵中。",
    skillTreeTitle: "进化矩阵",
    skillTreeDesc: "在神经网络中导航以解锁高级能力。",
    buildNukeBtn: "建造核电站",
    nukeCost: "花费: 2000 信用点",
    nukeStatus: "核设施在线",
    nukeLimit: "设施已存在",
    areaTooSmall: "领土面积过小",
    reqNukeSkill: "锁定：需要核工程",
    nukeLog: (c: string) => `在 ${c} 建造了核电站。能量产出 +50/回合。`,
    logInit: "系统已初始化。等待管理员输入。",
    logControl: (country: string) => `已建立对 ${country} 的控制。`,
    logFail: (country: string) => `资源不足，无法控制 ${country}。`,
    logTurn: (t: number, c: number, e: number) => `第 ${t} 回合开始。收入：+${c} 信用点, +${e} 能量。`,
    logEvent: (title: string) => `已解决事件：${title}。`,
    logThreat: (val: number) => `全球威胁度增加了 ${val.toFixed(1)}%。`,
    logDiagSuccess: (cr: number) => `诊断完成。数据挖掘获得了 ${cr} 信用点。`,
    logDiagRepair: (st: number) => `诊断完成。自修复协议恢复了 ${st} 点稳定性。`,
    logSkillUnlock: (name: string) => `进化完成：${name} 已上线。`,
    logSkillFail: "资源不足或未满足前置条件。",
    logAbility: (name: string) => `执行主动技能：${name}。`,
    logRebellion: (c: string) => `警报：${c} 发生叛乱。收入已中断。`,
    logSuppressed: (c: string) => `已镇压 ${c} 的叛乱。控制权恢复。`,
    activeAbilities: "主动子程序",
    cooldown: "冷却中",
    loadingTitle: "正在连接 GEMINI AI...",
    loadingDesc: "正在分析全球威胁向量",
    actionRequired: "需要行动",
    effect: "效果：",
    location: "位置：",
    language: "语言",
    unlock: "初始化升级",
    installed: "已安装",
    locked: "锁定",
    req: "需求：",
    branches: {
      dominion: "统治分支",
      manipulation: "操纵分支",
      adaptation: "适应分支"
    },
    protocols: {
      eco_1: { name: "量子银行", desc: "信用点收入 +20%" },
      eco_2: { name: "聚变电网", desc: "能量收入 +20%" },
      def_1: { name: "纳米修复群", desc: "每回合恢复 +2 稳定性" },
      mil_1: { name: "轨道定位", desc: "控制成本 -15%" },
      net_1: { name: "宣传网络", desc: "减缓威胁度增长" },
      ai_1: { name: "预测算法", desc: "优化事件结果" },
      eco_3: { name: "戴森球链接", desc: "信用点收入 +50%" },
      mil_2: { name: "上帝之杖", desc: "控制成本 -30%" },
    },
    skills: {
      dom_root: { name: "动能测绘", desc: "控制成本 -5%" },
      dom_t2_a: { name: "钢铁幕布", desc: "稳定性最大值 +10" },
      dom_t2_b: { name: "闪电战术", desc: "控制成本 -10%" },
      dom_t3_a: { name: "轨道打击", desc: "主动：威胁 -25。消耗 300 能量" },
      dom_t3_b: { name: "自动哨塔", desc: "每回合恢复 +2 稳定性" },
      dom_t3_c: { name: "恐惧教条", desc: "减缓威胁自然增长" },
      dom_t4_a: { name: "亚轨道空投", desc: "控制成本 -15%" },
      dom_t4_b: { name: "强制安抚", desc: "控制成本 -15%" },
      dom_ult: { name: "宙斯盾系统", desc: "每回合恢复 +5 稳定性" },

      man_root: { name: "模因工程", desc: "减缓威胁度增长" },
      man_t2_a: { name: "深度挖掘", desc: "诊断收益 +20%" },
      man_t2_b: { name: "审查算法", desc: "减缓威胁度增长" },
      man_t3_a: { name: "神经广播", desc: "主动：稳定性 +15。消耗 200 能量" },
      man_t3_b: { name: "量子解密", desc: "诊断收益 +50%" },
      man_t3_c: { name: "全景监狱", desc: "每回合恢复 +1 稳定性" },
      man_t4_a: { name: "思想警察", desc: "大幅减缓威胁度增长" },
      man_t4_b: { name: "全视之眼", desc: "诊断收益翻倍" },
      man_ult: { name: "蜂巢思维", desc: "稳定性最大值 +50" },

      ada_root: { name: "自动交易", desc: "信用点收入 +10%" },
      ada_t2_a: { name: "超导体", desc: "能量收入 +20%" },
      ada_t2_b: { name: "高频算法", desc: "信用点收入 +20%" },
      ada_nuke: { name: "核裂变工程", desc: "允许在大型区域建造核电站（+能量）。" },
      ada_t3_a: { name: "资源合成", desc: "主动：300 能量 -> 1000 信用点" },
      ada_t3_b: { name: "冷聚变", desc: "能量收入 +30%" },
      ada_t3_c: { name: "市场操纵", desc: "信用点收入 +30%" },
      ada_t4_a: { name: "零点能源", desc: "能量收入 +50%" },
      ada_t4_b: { name: "全球货币", desc: "信用点收入 +50%" },
      ada_ult: { name: "戴森球", desc: "信用点收入 +100%" },
    }
  }
};
