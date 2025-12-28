# Socket.IO Event Schema for MMO

This document defines the high-performance event protocol between Client and Server.

## 🟢 Client -> Server (Inputs)
These events are sent by the client. They describe **INTENT**, not result.

| Event Name | Payload Structure | Description | Rate Limit |
|---|---|---|---|
| `join_game` | `{ token: string }` | Authenticate and retrieve character execution. | Once |
| `input_move` | `{ x: float, y: float, rot: float, seq: int }` | Desired movement vector. `seq` used for reconciliation. | 20Hz |
| `input_cast` | `{ skillId: string, targetId?: string, dir?: Vector3 }` | Request to activate a skill. | Cooldown |
| `input_interact` | `{ targetId: string, type: 'loot'\|'npc' }` | Interaction request. | 5Hz |

## 🔵 Server -> Client (State & Snapshots)
Server outputs authoritative state. Client interpolates between these states.

| Event Name | Payload Structure | Description | Frequency |
|---|---|---|---|
| `w_init` | `FullZoneState` | Initial dump of all static & dynamic entities in zone. | On Join |
| `w_update` | `WorldSnapshot` | Delta-compressed changes for AOI (Area of Interest). | 20Hz |
| `ev_combat` | `{ src: string, dst: string, val: number, crit: bool }` | Damage/Heal numbers popup event. | Real-time |
| `ev_effect` | `{ id: string, visual: string, pos: Vector3 }` | Trigger a visual skill effect (Particle/Projectile). | Real-time |

## 💾 Data Structures

### WorldSnapshot
```typescript
{
  t: number,       // Server Timestamp
  m: CompactMob[], // Mobs that moved/changed
  p: CompactPly[], // Players that moved/changed
  r: string[]      // Removed Entity IDs (Despawn/Death)
}
```

### CompactMob (Optimized)
```typescript
[
  id,              // string
  typeIndex,       // string (mapped to config)
  x,               // float (quantized)
  y,               // float (quantized)
  hpPct            // int (0-100)
]
```

## 🛡️ Anti-Cheat & Security
- **Speed Hack:** Server calculates distance between `input_move` packets. If `dist > speed * dt`, correction is forced.
- **Cooldowns:** Server tracks last cast time. Early packets are ignored.
- **Range Check:** Interactions (Loot/Attack) validated against server-side distance.
