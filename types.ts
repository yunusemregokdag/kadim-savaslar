
import React from 'react';

export type CharacterClass = 'warrior' | 'arctic_knight' | 'gale_glaive' | 'archer' | 'archmage' | 'bard' | 'cleric' | 'martial_artist' | 'monk' | 'reaper';
export type Faction = 'marsu' | 'terya' | 'venu';

export enum SkillPathType {
  ATTACK = 'Saldırı',
  DEFENSE = 'Savunma',
  HYBRID = 'Hibrit'
}

export interface Skill {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  cd: number; // Cooldown in seconds
  manaCost: number;
  type: 'damage' | 'buff' | 'heal' | 'utility' | 'ultimate';
  icon: string; // Lucide icon name placeholder
  visual: string; // Effect key
  modelPath?: string; // Path to GLTF skill effect model
}

export interface ClassData {
  id: CharacterClass;
  name: string;
  name_en?: string;
  role: string;
  role_en?: string;
  description: string;
  description_en?: string;
  mechanic: string;
  mechanic_en?: string;
  skills: Skill[]; // Flat list of 7 active skills for the HUD
}

export interface ItemVisuals {
  model: string;
  subType?: 'long' | 'short' | 'curved' | 'double' | 'ornate' | 'nature' | 'recurve' | 'broad' | 'battle' | 'crystal' | 'magma';
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  glowIntensity?: number;
  particleEffect?: 'fire' | 'ice' | 'void' | 'lightning';
}

export interface Item {
  id: string;
  name: string;
  tier: number;
  plus?: number; // 0 to 10
  type: 'weapon' | 'armor' | 'helmet' | 'pants' | 'boots' | 'necklace' | 'earring' | 'material' | 'consumable' | 'pet_egg' | 'wing_fragment' | 'costume' | 'upgrade_scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient';
  value?: number;
  stats?: ItemStats;
  image?: string; // URL/Path to custom icon
  visuals?: ItemVisuals; // Data-driven rendering
  classReq?: CharacterClass; // Class restriction
  setId?: string; // Set bonus ID
}

export interface ItemStats {
  damage?: number;
  defense?: number;
  hp?: number;
  mana?: number;
  strength?: number;     // STR
  dexterity?: number;    // DEX
  intelligence?: number; // INT
  vitality?: number;     // VIT
  critChance?: number;   // %
  critDamage?: number;   // %
  attackSpeed?: number;  // %
  bonusGold?: number;    // % (Premium)
  bonusExp?: number;     // % (Premium)
}

// NEW: Wing Definition
export interface WingItem {
  id: string;
  name: string;
  type: 'angel' | 'demon' | 'dragon' | 'fairy' | 'seraph' | 'void';
  tier: number;
  bonusDamage: number;
  bonusHp: number;
  bonusDefense?: number; // New for premium
  bonusGoldRate?: number; // New for premium
  bonusHonorRate?: number; // New for premium
  color: string;
  modelPath?: string; // Path to GLTF wing model (for butterfly wings etc.)
  expiresAt?: number; // Timestamp for rental expiration
}

// NEW: Pet Definition
export interface PetItem {
  id: string;
  name: string;
  type: 'dragon_baby' | 'floating_crystal' | 'spirit_wolf' | 'owl' | 'phoenix';
  tier: number;
  bonusExpRate: number; // Percentage
  bonusDefense: number;
  bonusDamage?: number; // New
  bonusHp?: number;     // New
  bonusMana?: number;   // New
  color: string;
  modelPath?: string;   // New: Path to GLTF file
  expiresAt?: number; // Timestamp for rental expiration
}

export interface Equipment {
  weapon: Item | null;
  helmet: Item | null; // Kafa (Miğfer)
  armor: Item | null;  // Gövde (Zırh)
  pants: Item | null;  // Bacak (Pantolon)
  boots: Item | null;  // Ayak (Çizme)
  necklace: Item | null; // Kolye
  earring: Item | null;  // Küpe
}

export interface Item {
  id: string;
  name: string;
  tier: number;
  plus?: number; // 0 to 10
  type: 'weapon' | 'armor' | 'helmet' | 'pants' | 'boots' | 'necklace' | 'earring' | 'material' | 'consumable' | 'pet_egg' | 'wing_fragment' | 'costume' | 'upgrade_scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient';
  value?: number;
  stats?: ItemStats;
  image?: string; // URL/Path to custom icon
  icon?: string; // Optional: Lucide Icon name or Emoji
  desc?: string; // Short description
  visuals?: ItemVisuals; // Data-driven rendering
  classReq?: CharacterClass; // Class restriction
  levelReq?: number; // Level restriction
  description?: string;
  setId?: string; // Set bonus ID for matching set pieces
  effect?: {
    type: 'heal' | 'mana' | 'combo' | 'buff' | 'cleanse';
    amount?: number;
    hpAmount?: number;
    manaAmount?: number;
    buffType?: 'exp' | 'gold' | 'damage' | 'defense';
    duration?: number;
  };
}

export interface ItemStats {
  damage?: number;
  defense?: number;
  hp?: number;
  mana?: number;
  strength?: number;     // STR - Güç
  dexterity?: number;    // DEX - Çeviklik
  intelligence?: number; // INT - Zeka
  vitality?: number;     // VIT - Dayanıklılık
  luck?: number;         // LCK - Şans
  critChance?: number;   // % - Kritik Şansı
  critDamage?: number;   // % - Kritik Hasarı
  attackSpeed?: number;  // % - Saldırı Hızı
  speed?: number;        // Hareket Hızı
  bonusGold?: number;    // % (Premium)
  bonusExp?: number;     // % (Premium)
  // Elemental
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  voidDamage?: number;
  fireResist?: number;
  iceResist?: number;
  lightningResist?: number;
  // Special
  lifesteal?: number;
  manaRegen?: number;
  hpRegen?: number;
  cooldownReduction?: number;
}

export interface WingItem {
  id: string;
  name: string;
  type: 'angel' | 'demon' | 'dragon' | 'fairy' | 'seraph' | 'void';
  tier: number;
  bonusDamage: number;
  bonusHp: number;
  bonusDefense?: number; // New for premium
  bonusGoldRate?: number; // New for premium
  bonusHonorRate?: number; // New for premium
  color: string;
  modelPath?: string; // Path to custom GLTF model
  expiresAt?: number; // Timestamp for rental expiration
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  targetEnemyName: string;
  requiredCount: number;
  currentCount: number;
  rewardGold: number;
  rewardXp: number;
  rewardHonor: number; // Added Honor Reward
  rewardItem?: Item;
  isCompleted: boolean;
}

export interface Rank {
  id: number;
  title: string;
  minRP: number; // Base RP requirement (Mock cutoff)
  bonusDamage: number;
  bonusShield: number;
  icon: string; // Emoji
  image?: string; // Image path (e.g. /ranks/orgeneral.png)
  limitType?: 'count' | 'percent';
  limitValue?: number;
  order?: number; // 1 is highest
}

export interface HUDElement {
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  scale: number; // 0.5 to 2.0
  enabled: boolean;
}

// Flexible Layout for separate customization
export interface HUDLayout {
  elements: Record<string, HUDElement>;
}

export interface Settings {
  pvpPriority: boolean;
  showNames: boolean;
  // New UI Settings
  deviceMode: 'auto' | 'mobile' | 'desktop';
  skillBarMode: 'linear' | 'arc';
  hudScale: number; // Global HUD scale (0.5 - 1.5)
  buttonOpacity: number; // Button opacity (0.5 - 1.0)
  transparentMap: boolean;
  smallMap: boolean;
  minimizeQuest: boolean;
  hudLayout: HUDLayout; // Updated type
  // Premium Features
  nameColor?: string; // Custom name color for premium players (hex color)
  // Auto Features
  autoLoot: boolean; // Auto collect loot boxes
}

export interface PlayerState {
  nickname: string;
  class: CharacterClass | null;
  faction: Faction | null;
  guildName: string | null;
  level: number;
  exp: number;
  maxExp: number;
  credits: number;
  gems: number;

  honor: number;
  premiumUntil?: number; // Timestamp for subscription expiry
  premiumTier?: 'none' | 'bronze' | 'silver' | 'gold' | 'diamond'; // Premium tier
  premiumBenefits?: {
    expMultiplier: number;
    goldMultiplier: number;
    dropRateBonus: number;
    inventorySlots: number;
    storageSlots: number;
    dailyGems: number;
    nameColor: string;
    badge: string;
    discountPercent: number;
  };
  rankPoints: number;
  rank: number;

  questStage: number;

  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  damage: number;
  defense: number;

  // Character Stats (RPG Build System)
  strength: number;      // STR: Increases Melee Dmg
  dexterity: number;     // DEX: Increases Ranged Dmg / Defense
  intelligence: number;  // INT: Increases Magic Dmg / Mana
  vitality: number;      // VIT: Increases HP / Defense
  statPoints: number;    // Points available to distribute

  inventory: Item[];
  equipment: Equipment;

  // NEW: Wing and Pet System Storage
  ownedWings: WingItem[];
  equippedWing: WingItem | null;
  ownedPets: PetItem[];
  equippedPet: PetItem | null;

  // NEW: Skins (Costumes)
  ownedSkins: string[];
  equippedSkin: string | null;

  activeQuest: Quest | null;
  settings: Settings;

  // Daily Login & Achievements
  dailyLogin?: DailyLoginState;
  achievements?: Achievement[];
}

export type EntityType = 'player' | 'mob' | 'npc' | 'boss' | 'elite' | 'slime';

export interface GameEntity {
  id: string;
  type: EntityType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  level: number;
  isHostile: boolean;
  color?: string;
  lastAttackTime?: number;
  isAttacking?: boolean;
  hitFlash?: number;
  npcType?: NPCType; // For NPC interaction
  modelPath?: string; // Specific GLTF model path (e.g. for NPCs)
  // Combat stats
  defense?: number; // Reduces incoming damage
  damage?: number;  // Attack damage
  attackRange?: number; // Attack range
  // Boss AI Data
  bossData?: {
    phase: 1 | 2 | 3;
    isRaged: boolean;
    currentSkill: string | null;
    skillTarget?: { x: number, y: number, radius: number, warnTime: number };
  };
}

export interface LootLog {
  id: number;
  message: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  type: 'system' | 'player' | 'global' | 'party' | 'guild';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  createdAt: number;
}

export interface LootBox {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  tier: number;
  item?: Item;
  ownerId: string;
  createdAt: number;
}

export interface Portal {
  id: string;
  x: number;
  z: number;
  targetZone: number;
  target: number; // Alias for targetZone (backward compatibility)
  levelReq: number;
  name: string;
}

export interface CraftingMaterial {
  itemId: string;
  count: number;
}

export interface CraftingRecipe {
  id: string;
  resultItem: Item;
  materials: CraftingMaterial[];
  goldCost: number;
  levelReq: number;
  category: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
}

export type NPCType = 'shop' | 'quest' | 'blacksmith' | 'healer' | 'guide' | 'merchant' | 'quest_giver' | 'arena_master' | 'guild_master';

export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  dialogue?: string[];
  zoneId?: number; // Optional zone restriction
  modelPath?: string; // Optional GLTF model
}

export interface DailyLoginReward {
  day: number;
  gold?: number;
  gems?: number;
  exp?: number;
  honor?: number;
  item?: Item;
  icon: string; // Lucide icon name
}

export interface DailyLoginState {
  lastLoginDate: string; // YYYY-MM-DD
  consecutiveDays: number;
  claimedToday: boolean;
  totalLogins: number; // Lifetime
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'combat' | 'collection' | 'social' | 'misc';
  currentProgress: number;
  maxProgress: number;
  isCompleted: boolean;
  rewardGold?: number;
  rewardGems?: number;
  rewardExp?: number;
  rewardItem?: Item;
  rewardTitle?: string;
}

// NEW: Party and Guild Interfaces
export type GuildRank = 'leader' | 'co_leader' | 'officer' | 'member' | 'recruit';

export interface GuildMember {
  id: string;
  nickname: string;
  class: CharacterClass;
  level: number;
  rank: GuildRank;
  contribution: number;
  lastOnline: number;
  joinedAt: number;
}

export interface PartyMember {
  id: string;
  nickname: string;
  class: CharacterClass;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  isOnline: boolean;
  isLeader: boolean;
  zoneId: number;
}

export interface Party {
  id: string;
  name: string;
  leaderId: string;
  members: PartyMember[];
  maxMembers: number;
  createdAt: number;
  isPublic: boolean;
  lootRule: 'free_for_all' | 'round_robin' | 'leader_only';
}

export interface Guild {
  id: string;
  name: string;
  tag: string;
  leaderId: string;
  members: GuildMember[]; // Changed from string[] to GuildMember[]
  maxMembers: number;
  level: number;
  exp: number;
  gold: number;
  createdAt: number;
  description: string;
  motd: string;
  emblemColor: string;
  isRecruiting: boolean;
  minLevelReq: number;
  bonusExp: number;
  bonusGold: number;
  bonusDamage: number;
}

export interface TradeOffer {
  playerId: string;
  isReady: boolean;
  isConfirmed: boolean;
  gold: number;
  items: Item[];
}

export interface Trade {
  id: string;
  senderId: string;
  senderNickname?: string; // Optional for UI convenience
  receiverId: string;
  receiverNickname?: string; // Optional for UI convenience
  sender: TradeOffer;
  receiver: TradeOffer;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
}
