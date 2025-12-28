
# 🔐 Economy Isolation Strategy

This document details how the Economic Layer is protected from the Game Layer.

## 1. The Principle of Isolation

In many MMO exploits, bugs occur when "Gameplay" logic directly modifies "Wealth".
*   *Bad*: `MobOnDeath() { player.gold += 100 }` (Vulnerable to memory editing or logic bugs causing loop).
*   *Good*: `MobOnDeath() { TransactionGuard.request(player, 'LOOT', 100) }`

## 2. Architecture

```
[ Game Engine ]  ==>  [ Transaction Guard ]  ==>  [ Economy Service ]  ==>  [ Database ]
(In-Memory/Fast)      (Validation/Lock)           (Atomic Logic)            (Persistent/Slow)
```

## 3. TransactionGuard Rules
1.  **Concurrency Lock**: A player cannot start `Trade` while `Shop Purchase` is pending.
2.  **Source Validation**: Every gold mutation requires a strict `Reason` (e.g. `AUCTION_BUY`).
3.  **Atomic Only**: We never do `p.gold = p.gold + 5`. We call `transfer(p, target, 5)`.

## 4. Real Money Trading (RMT) & Premium
*   Gems (Premium) are stored in the same `Wallet` schema but handled by separate API endpoints (`/billing/callback`).
*   The `EconomyService` does not allow `Gold -> Gems` conversion unless explicitly enabled.
*   `Gems -> Gold` (P2W) can be enabled via `ExchangeService` if desired, but is isolated.

## 5. Security Guarantee
By forcing all economy actions through `TransactionGuard.wrap()`, we ensure:
1.  Logs are generated for every copper piece moved.
2.  Race conditions (Double spending) are blocked by the Lock Set.
3.  Database integrity is maintained via atomic Commit structure.
