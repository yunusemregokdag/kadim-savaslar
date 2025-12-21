



export type CharacterClass = 'warrior' | 'mage' | 'shaman' | 'ranger' | 'assassin';
export type Faction = 'marsu' | 'terya' | 'venu';

export enum SkillPathType {
  ATTACK = 'Saldırı',
  DEFENSE = 'Savunma',
  HYBRID = 'Hibrit'
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  cd: number; // Cooldown in seconds
  manaCost: number;
  type: 'damage' | 'buff' | 'heal' | 'utility' | 'ultimate';
  icon: string; // Lucide icon name placeholder
  visual: string; // Effect key
}

export interface ClassData {
  id: CharacterClass;
  name: string;
  role: string;
  description: string;
  mechanic: string;
  skills: Skill[]; // Flat list of 7 active skills for the HUD
}

export interface ItemVisuals {
  model: 'sword' | 'axe' | 'dagger' | 'staff' | 'bow' | 'shield' | 'hammer' | 'book';
  subType?: 'long' | 'short' | 'curved' | 'double' | 'ornate';
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
  type: 'weapon' | 'armor' | 'helmet' | 'pants' | 'material' | 'consumable' | 'pet_egg' | 'wing_fragment' | 'costume' | 'upgrade_scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'ancient';
  value?: number;
  stats?: ItemStats;
  image?: string; // URL/Path to custom icon
  visuals?: ItemVisuals; // Data-driven rendering
  classReq?: CharacterClass; // Class restriction
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
  helmet: Item | null; // Kafa
  armor: Item | null;  // Gövde (+Kollar)
  pants: Item | null;  // Pantolon (+Ayak)
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
  minRP: number;
  bonusDamage: number;
  bonusShield: number;
  icon: string;
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

  activeQuest: Quest | null;
  settings: Settings;
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
  target: number; // Alias for targetZone
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
  category: 'weapon' | 'armor' | 'consumable' | 'material';
}
