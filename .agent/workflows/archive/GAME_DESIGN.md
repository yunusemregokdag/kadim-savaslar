# Kadim Savaşlar - Master Game Design Document (v3.0)

## 1. Core Systems & Economy

**Currencies:**
*   **Gold:** Standard currency. Dropped by all mobs. Used for T1-T3 items, potions, and basic crafting.
*   **Diamond:** Premium currency. Dropped ONLY by Elites (Low chance) and Bosses (Guaranteed). Used for T4-T5 crafting, special upgrades, and cosmetics.

**Progression Philosophy (DarkOrbit-Style):**
*   **Early Game (Lvl 1-10):** Fast progression. Mobs die in 2-4 hits. High dopamine.
*   **Mid Game (Lvl 11-20):** The "Wall". Mobs require gear upgrades. Grouping becomes efficient.
*   **End Game (Lvl 21-30):** Long grind. Boss hunting. PvP for resources.
*   **Economy:** Inflation-proof. Gold sinks in crafting and upgrades. Diamonds are strictly gated.

---

## 2. World & Map Configuration

### Kingdom Map Structure
Each Kingdom (Marsu, Terya, Venu) has identical map layouts but unique aesthetics/mobs.

| Region Type | Map IDs | Level Range | Respawn (Normal) | Respawn (Elite) | Respawn (Boss) | Anti-Bot Rules |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Beginner** | 1-1, 2-1, 3-1 | 1 - 4 | 3 sec | N/A | N/A | Strict Radius Check |
| **Plains** | 1-2, 2-2, 3-2 | 5 - 8 | 5 sec | N/A | N/A | Strict Radius Check |
| **Valley** | 1-3, 2-3, 3-3 | 9 - 12 | 8 sec | 60 sec | N/A | Diminishing Returns |
| **Transition**| 1-4, 2-4, 3-4 | 13 - 16 | 10 sec | 90 sec | N/A | Diminishing Returns |
| **Dungeon** | 1-5, 2-5, 3-5 | 17 - 20 | 15 sec | 120 sec | 30 min | Active Movement Req |
| **Deep Hell** | 1-6, 2-6, 3-6 | 21 - 25 | 20 sec | 180 sec | 1 hour | Active Movement Req |
| **Boss Lair** | 1-7, 2-7, 3-7 | 26 - 29 | 30 sec | 300 sec | 4 hours | Raid Logs |
| **Throne** | 1-8, 2-8, 3-8 | 30 | N/A | N/A | 8 hours | Guild Flagging |

---

## 3. Bestiary (Mob Stats & Rewards)

**Scaling Logic:**
*   **HP:** Exponential growth. Lvl 20 mob has 50x HP of Lvl 1.
*   **Defense:** Critical stat. Low level players deal 0 damage to High level mobs.
*   **Diamonds:** 0% for Normal mobs. 1-5% for Elites. 100% for Bosses.

### Global Mob Table

| Mob Name | Type | Lvl | HP | Atk | Def | EXP | Gold | Diamond Chance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Starter Mobs** | | | | | | | | |
| Ateş/Su/Doğa Piyonu | Normal | 1 | 250 | 15 | 5 | 50 | 10-20 | 0% |
| Vahşi Köpek | Normal | 2 | 400 | 25 | 10 | 90 | 20-30 | 0% |
| Zehirli Mantar | Normal | 3 | 700 | 40 | 20 | 150 | 35-50 | 0% |
| **Mid-Tier (The Wall)** | | | | | | | | |
| Zırhlı Böcek | Wall | 8 | 2,500 | 120 | 80 | 600 | 150-200 | 0% |
| Genç Ejder/Naga | Normal | 12 | 6,000 | 250 | 150 | 1,200 | 300-400 | 0% |
| Taş Golem | Elite | 15 | 15,000 | 500 | 400 | 4,000 | 800-1k | 1% (1-2) |
| **Endgame Drops** | | | | | | | | |
| Karanlık Şövalye | Elite | 20 | 35,000 | 900 | 900 | 12,000 | 2k-3k | 5% (2-5) |
| Cehennem Bekçisi | Elite | 25 | 80,000 | 1,800 | 2,500| 30,000 | 5k-7k | 10% (5-10)|
| **BOSSES** | | | | | | | | |
| **Ateş Ejderi** | **BOSS** | **30** | **2,000,000** | **5,000** | **10,000** | **500,000** | **100k** | **100% (100)** |
| **Okyanus Kralı** | **BOSS** | **30** | **2,000,000** | **5,000** | **10,000** | **500,000** | **100k** | **100% (100)** |
| **Gargantua** | **BOSS** | **30** | **2,500,000** | **6,000** | **12,000** | **600,000** | **120k** | **100% (120)** |

---

## 4. Item System & Tiers

### Tier Structure & Drops
| Tier | Name | Level Req | Drop Source | Quality Chance | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T1** | Novice | 1 | Lvl 1-5 Mobs | 70% Normal / 30% Medium | Basic starter gear |
| **T2** | Apprentice| 6 | Lvl 6-12 Mobs | 60% Normal / 35% Med / 5% Prem | First major upgrade |
| **T3** | Veteran | 16 | Lvl 13-25 Mobs | 50% Normal / 40% Med / 10% Prem | Best droppable gear |
| **T4** | **Elite** | **22** | **CRAFT ONLY** | Always Premium | Requires T3 + Diamonds |
| **T5** | **Mythic** | **28** | **CRAFT ONLY** | Always Premium + Glow | Requires T4 + Boss Drop |

### Quality (Rarity) Bonuses
*   **Normal (Green):** Base Stats.
*   **Medium (Blue):** +20% Stats.
*   **Premium (Orange):** +40% Stats + Unique Sub-stat (Crit / Cooldown / Vamp).

---

## 5. Class & Weapon Design

Every class has specific weapon types that dictate their playstyle.

| Class | Wep Type 1 | Playstyle | Wep Type 2 | Playstyle | Wep Type 3 | Playstyle |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Warrior** | **Sword** | Balanced DPS | **Axe** | Slow/High Dmg | **Mace** | Stun/CC |
| **Arctic Knight**| **Frostblade** | Slow/Heavy | **Ice Spear** | Pierce/Range | **Shield** | Tanking |
| **Gale Rider** | **Glaive** | AoE Sweep | **Dual Blades** | Fast Atk | **Spear** | Mobility |
| **Archer** | **Shortbow** | Rapid Fire | **Longbow** | Snipe/Range | **Crossbow** | High Pierce |
| **Mage** | **Staff** | AoE Burst | **Wand** | Fast Cast | **Orb** | Mana Sustain |
| **Bard** | **Lute** | Buffs | **Flute** | Debuffs | **Harp** | AoE Heal |
| **Cleric** | **Mace** | Melee/Heal | **Tome** | Range/Cast | **Scepter** | Hybrid |
| **Martial Artist**|**Fist** | Combo | **Nunchaku** | CC Chain | **Staff** | Reach |
| **Monk** | **Beads** | Spirit Dmg | **Staff** | Defense | **Knuckles** | Fast |
| **Reaper** | **Scythe** | Cleave | **Dagger** | Execute | **Chain** | Mid-Range |

### Progression Matrix
*   **Levels 1-5:** Use Rusty/Training Weapons (T1).
*   **Levels 6-15:** Use Iron/Steel Weapons (T2).
*   **Levels 16-25:** Use Mithril/Elemental Weapons (T3).
*   **Levels 26+:** Craft Dragon/Void Weapons (T4/T5).

---

## 6. Anti-Bot & Perfomance Systems

### Anti-Bot "The Watcher" System
1.  **Diminishing Returns (DR):**
    *   Killing >20 mobs within 10m radius reduces drops by 10% per kill until 0%.
    *   Reset: Move >30m away.
2.  **The Punisher:**
    *   **Shadow Assassin:** Spawns if a player is AFK farming for >30 mins.
    *   Immune to Auto-Attacks. Only takes skill damage.
    *   Kills player = Player loses 5% EXP.
3.  **Pattern Detection:**
    *   Client logs clicks per second. Consistent 100ms clicks = Kick.

### Performance & FPS Optimizations
1.  **Object Pooling:**
    *   Projectiles (Arrows, Magic) are recycled, never destroyed.
    *   Damage Numbers are recycled UI elements.
2.  **Drop Stacking:**
    *   Ground Items stack automatically within 2m.
    *   Limit: 50 stacks per zone. Oldest gets deleted.
3.  **Economy Cleanup:**
    *   Low value drops (Grey items) auto-sell option in settings to prevent ground clutter.

