# KADIM SAVAŞLAR - DESIGN SPECIFICATION (PHASE 1)

## 1. Mob Progression & Stats (DarkOrbit Logic)

The progression curve simulates the "Zero to Hero" journey. Early mobs are fodder; mid-game mobs are obstacles; endgame mobs are raids.

### Level 1-10: The Rookie Phase (Fast Paced)
*Goal: dopamine hits, learning mechanics, rapid leveling.*

| Mob Name | Level | HP | Atk | Def | EXP | Gold | Diamond | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Faction Pawn** | 1 | 250 | 15 | 5 | 50 | 15 | - | One-shot kill |
| **Wild Beast** | 3 | 500 | 25 | 15 | 100 | 30 | - | Reactive target |
| **Scout** | 5 | 1,200 | 60 | 40 | 300 | 80 | - | First gear check |
| **Armored Beetle**| 8 | 2,500 | 120 | 80 | 600 | 200 | - | "The Wall" (Needs T2 Wep) |

### Level 11-20: The Soldier Phase (Grind & Group)
*Goal: Gear checks, positioning matters, gatekeepers.*

| Mob Name | Level | HP | Atk | Def | EXP | Gold | Diamond | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Gatekeeper** | 12 | 6,000 | 250 | 150 | 1,200 | 400 | - | Transition mob (x-4) |
| **Elite Golem** | 15 | 15,000 | 500 | 400 | 4,000 | 1,000| 1% | Mini-Boss (Solo hard) |
| **Shadow Knight**| 18 | 25,000 | 800 | 800 | 8,000 | 2,000| 3% | Group/Kiting required |

### Level 21-30: The Warlord Phase (Raid & PvP)
*Goal: High-value targets, resource wars, massive HP pools.*

| Mob Name | Level | HP | Atk | Def | EXP | Gold | Diamond | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Abyss Guard** | 22 | 40,000 | 1,200 | 1,500 | 15k | 3,500| 5% | Farming spot |
| **Ancient Lord** | 26 | 90,000 | 2,000 | 3,000 | 40k | 7,000| 10% | Pre-Boss |
| **KINGDOM BOSS** | 30 | 2.5m | 6,000 | 15k | 600k | 120k | 100% | Guild Raid Required |

---

## 2. Respawn & Map Rules

### Anti-Frustration System (Beginner Maps)
* **Maps:** 1-1, 1-2, 2-1, 2-2, 3-1, 3-2
* **Respawn Time:** **3 seconds** (Instant feel)
* **Density:** High (Mobs everywhere)
* **Logic:** If player count > 10, spawn rate doubles.

### The Grind System (Mid Maps)
* **Maps:** 1-3, 1-4, 2-3, 2-4, 3-3, 3-4
* **Respawn Time:** **10-15 seconds**
* **Density:** Medium (Patrol paths)
* **Logic:** Requires moving between packs.

### Value System (Endgame/Dungeons)
* **Maps:** 1-5+, PvP Zone
* **Respawn Time:** **60 seconds (Elites), 4 hours (Bosses)**
* **Density:** Low (Strategic placement)
* **Logic:** Kills are meaningful. Competition encouraged.

---

## 3. Anti-Bot "Diminishing Returns" (The Watcher)

To prevent AFK farming at a single coordinate:

1.  **The Radius Check:**
    *   Server tracks `Player_Kill_Center` (XYZ).
    *   If player kills >20 mobs within **10 meters** of center:
        *   Trigger `Debuff: Exhaustion`.

2.  **Exhaustion Tiers:**
    *   **Tier 1:** Drops reduced by 50% (Warning).
    *   **Tier 2:** Drops reduced by 100% (No Loot).
    *   **Tier 3:** EXP reduced by 100% (No Progress).

3.  **Reset Condition:**
    *   Player must move **>50 meters** away or enter a Portal.
    *   Cooldown: 5 minutes.

---

## 4. Drop & Itemization System

### Tier Distribution
| Tier | Source | Availability |
| :--- | :--- | :--- |
| **T1** | Mobs Lvl 1-5 | Common Drop |
| **T2** | Mobs Lvl 6-15 | Common Drop |
| **T3** | Mobs Lvl 16-25 | Rare Drop |
| **T4** | **CRAFTING** | **NO DROP** (Requires T3 Item + Diamonds) |
| **T5** | **CRAFTING** | **NO DROP** (Requires T4 Item + Boss Essence) |

### Quality Color Coding (T1-T3 Only)
*   **Normal (Green):** Base Stats. (70% Chance)
*   **Medium (Blue):** +20% Stats. (25% Chance)
*   **Premium (Orange):** +40% Stats + Bonus Prop. (5% Chance)
    *   *Note: T4/T5 are always Premium quality by default.*

---

## 5. Economic Balance (Gold vs. Diamond)

*   **Gold Sinks:**
    *   Potions (Huge sink in PvP).
    *   T1-T3 Gear Upgrades (Blacksmith).
    *   Guild Creation.
    *   T4 Crafting Tax.

*   **Diamond Sinks (Premium):**
    *   **T4 / T5 Crafting Materials.**
    *   Cosmetic Wings / Pets.
    *   Speed-ups (if implemented).
    *   **High-End Ammo/Buffs.**

---

**READY FOR PHASE 2 (CONFIG BLOCKS)**
