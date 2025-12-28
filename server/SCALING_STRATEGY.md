# MMO Production Scaling Strategy

This document outlines the roadmap from development to 1000+ Concurrent Users (CCU).

## 🟢 Phase 1: Vertical Scaling (0 - 500 CCU)
Current architecture is optimized for a single high-performance Node.js process.

### Configuration
- **Server:** 4 vCPU, 8GB RAM
- **AOI:** Enabled (Grid 50x50)
- **Instancing:** Worker Threads for Dungeons
- **Protocol:** Protobuf (Binary)

### Performance Targets
- **Tick Rate:** Stable 20Hz (50ms)
- **RAM Usage:** ~100MB + (2KB per Player) + (10MB per Dungeon)
- **Bandwidth:** ~1-2 MB/s outbound

---

## 🟡 Phase 2: Zone-Based Sharding (500 - 2000 CCU)
When the main loop exceeds 40ms processing time, we split zones across servers.

### Architecture
- **Shard A:** Handles Zone 1, 2, 3 (Starting Areas)
- **Shard B:** Handles Zone 10, 11 (Mid-game)
- **Shard C:** Handles Dungeons (Pure Worker Pool)

### Infrastructure Changes
1. **Redis Pub/Sub:** Required for Cross-Zone Chat & Guild Messages.
2. **Nginx/HAproxy:** Route WebSocket connections based on Zone ID.
3. **Session Store:** Redis required to track which Player is on which Shard.

---

## 🔴 Phase 3: World Partitioning (2000+ CCU)
If a SINGLE ZONE (e.g. Town) exceeds 500 players, we verify geometry sharding.

### Strategy
- **Channels:** "Zone 1 - Channel 1", "Zone 1 - Channel 2".
- Players choose channel or auto-assigned.
- Reduces AOI density per instance.

---

## 🛑 Critical Bottlenecks & Solutions
| Bottleneck | Symptom | Solution |
|---|---|---|
| **Bandwidth** | High latency not CPU related | Increase Quantization (x10 -> x5), Reduce Tick (20Hz -> 10Hz for far entities) |
| **CPU (Physics)** | Game Loop > 50ms | Offload Collision/Pathfinding to Rust module (FFI) |
| **DB Latency** | Slow Login/Inventory | Move ALL hot data to Redis. Sync to DB only on Logout/SaveInterval. |
