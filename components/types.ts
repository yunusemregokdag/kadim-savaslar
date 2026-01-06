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
  cd: number;
  manaCost: number;
  levelReq?: number;
  type: 'damage' | 'buff' | 'heal' | 'utility' | 'ultimate';
  icon: string;
  visual: string;
  modelPath?: string;
  isAoE?: boolean;
  duration?: number;
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
  skills: Skill[];
}

export interface ItemVisuals {
  model: 'sword' | 'axe' | 'spear' | 'glaive' | 'harp' | 'gauntlet' | 'beads' | 'scythe' | 'staff' | 'bow' | 'hammer' | 'lance' | 'mace' | 'shield' | string;
  subType?: 'long' | 'short' | 'curved' | 'double' | 'ornate' | 'nature' | 'recurve' | 'broad' | 'battle' | 'crystal' | 'magma';
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  glowIntensity?: number;
  particleEffect?: 'fire' | 'ice' | 'void' | 'lightning';
}

export interface ItemStats {
  damage?: number;
  defense?: number;
  hp?: number;
  mana?: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  vitality?: number;
  luck?: number;
  critChance?: number;
  critDamage?: number;
  attackSpeed?: number;
  speed?: number;
  bonusGold?: number;
  bonusExp?: number;
  fireDamage?: number;
  iceDamage?: number;
  lightningDamage?: number;
  voidDamage?: number;
  fireResist?: number;
  iceResist?: number;
  lightningResist?: number;
  lifesteal?: number;
  manaRegen?: number;
  hpRegen?: number;
  cooldownReduction?: number;
}

export interface Item {
  id: string;
  name: string;
  tier: number;
  plus?: number;
  type: 'weapon' | 'armor' | 'helmet' | 'pants' | 'boots' | 'necklace' | 'earring' | 'material' | 'consumable' | 'pet_egg' | 'wing_fragment' | 'costume' | 'upgrade_scroll' | 'mount';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient';
  value?: number;
  stats?: ItemStats;
  image?: string;
  icon?: string;
  desc?: string;
  visuals?: ItemVisuals;
  classReq?: CharacterClass;
  levelReq?: number;
  description?: string;
  setId?: string;
  effect?: {
    type: 'heal' | 'mana' | 'combo' | 'buff' | 'cleanse';
    amount?: number;
    hpAmount?: number;
    manaAmount?: number;
    buffType?: 'exp' | 'gold' | 'damage' | 'defense';
    duration?: number;
  };
  durability?: number;
  maxDurability?: number;
}

export interface WingItem {
  id: string;
  name: string;
  type: 'angel' | 'demon' | 'dragon' | 'fairy' | 'seraph' | 'void' | 'angel_demon';
  tier: number;
  bonusDamage: number;
  bonusHp: number;
  bonusDefense?: number;
  bonusGoldRate?: number;
  bonusHonorRate?: number;
  color: string;
  secondaryColor?: string;
  modelPath?: string;
  expiresAt?: number;
}

export interface PetItem {
  id: string;
  name: string;
  type: 'dragon_baby' | 'floating_crystal' | 'spirit_wolf' | 'owl' | 'phoenix' | 'mount' | 'speed';
  tier: number;
  bonusExpRate: number;
  bonusDefense: number;
  bonusDamage?: number;
  bonusHp?: number;
  bonusMana?: number;
  bonusSpeed?: number;  // Movement speed bonus (for mounts)
  color: string;
  modelPath?: string;
  expiresAt?: number;
}

export interface MountItem {
  id: string;
  name: string;
  tier: number;
  speedBonus: number;
  icon: string;
  description?: string;
  modelPath?: string;
  expiresAt?: number;
}

export interface Equipment {
  weapon: Item | null;
  helmet: Item | null;
  armor: Item | null;
  pants: Item | null;
  boots: Item | null;
  necklace: Item | null;
  earring: Item | null;
}

export interface Quest {
  id: string | number;
  title: string;
  description: string;
  targetEnemyName?: string;
  requiredCount: number;
  currentCount: number;
  rewardGold: number;
  rewardXp: number;
  rewardHonor: number;
  rewardGems?: number;
  rewardItem?: Item;
  isCompleted: boolean;
}

export interface Rank {
  id: number;
  title: string;
  minRP: number;
  bonusDamage: number;
  bonusShield: number;
  icon: string;
  iconPath?: string;
  image?: string;
  limitType?: 'count' | 'percent';
  limitValue?: number;
  order?: number;
}

export interface HUDElement {
  x: number;
  y: number;
  scale: number;
  enabled: boolean;
  opacity: number;
  locked: boolean;
}

export interface HUDLayout {
  elements: Record<string, HUDElement>;
}

export interface Settings {
  pvpPriority: boolean;
  showNames: boolean;
  deviceMode: 'auto' | 'mobile' | 'desktop';
  skillBarMode: 'linear' | 'arc';
  hudScale: number;
  buttonOpacity: number;
  transparentMap: boolean;
  smallMap: boolean;
  minimizeQuest: boolean;
  hudLayout: HUDLayout;
  nameColor?: string;
  autoLoot: boolean;
}

export interface PlayerState {
  nickname: string;
  userId?: string;
  class: CharacterClass | null;
  faction: Faction | null;
  lastPosition?: { x: number, y: number, z: number };
  guildName: string | null;
  level: number;
  exp: number;
  maxExp: number;
  credits: number;
  gems: number;
  diamonds: number;   // Elmas
  donateCoins: number;
  honor: number;
  vipUntil?: number;
  vipTier?: number;
  lastVipClaim?: number;
  premiumUntil?: number;
  premiumTier?: 'none' | 'bronze' | 'silver' | 'gold' | 'diamond';
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
  dailyHonor: number;
  dailyAdsWatched: number;
  extraMarketSlots?: number;
  extraStorage?: number;
  questStage: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  damage: number;
  defense: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  statPoints: number;
  inventory: Item[];
  equipment: Equipment;
  ownedWings: WingItem[];
  equippedWing: WingItem | null;
  ownedPets: PetItem[];
  equippedPet: PetItem | null;
  ownedSpeedPets: PetItem[];
  equippedSpeedPet: PetItem | null;
  ownedMounts: MountItem[];
  equippedMount: MountItem | null;
  ownedSkins: string[];
  equippedSkin: string | null;
  ownedCostumes: string[];
  equippedCostume: string | null;
  activeQuest: Quest | null;
  settings: Settings;
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
  npcType?: NPCType;
  modelPath?: string;
  defense?: number;
  damage?: number;
  attackRange?: number;
  exp?: number;
  gold?: number;
  diamond?: number;
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
  target?: number; // Alias for targetZone (backward compatibility)
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

export type NPCType = 'shop' | 'quest' | 'blacksmith' | 'healer' | 'guide' | 'merchant' | 'quest_giver' | 'arena_master' | 'guild_master' | 'craftmaster';

export interface NPCData {
  id: string;
  name: string;
  type: NPCType;
  dialogue?: string[];
  zoneId?: number;
  modelPath?: string;
}

export interface DailyLoginReward {
  day: number;
  gold?: number;
  gems?: number;
  exp?: number;
  honor?: number;
  item?: Item;
  icon: string;
}

export interface DailyLoginState {
  lastLoginDate: string;
  consecutiveDays: number;
  claimedToday: boolean;
  totalLogins: number;
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
  members: GuildMember[];
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
  senderNickname?: string;
  receiverId: string;
  receiverNickname?: string;
  sender: TradeOffer;
  receiver: TradeOffer;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
}
