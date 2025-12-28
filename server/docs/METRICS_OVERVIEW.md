
# 📊 Metrics & Monitoring Overview

This document explains the Grafana/Prometheus monitoring setup for the MMO server.

## 1. Core Metrics

| Metric Name | Type | Description | Alert Threshold |
| :--- | :--- | :--- | :--- |
| `game_tick_duration_ms` | Histogram | Time taken to process one server frame. | > 45ms (Close to 50ms cap) |
| `game_active_players` | Gauge | Total Concurrent Users (CCU). | N/A |
| `net_packets_out_total` | Counter | Total bandwidth throughput (count). | Rate > 10k/sec |
| `game_boss_cpu_usage_pct` | Gauge | Estimated CPU load of Boss AI. | > 20% |
| `shard_status` | Gauge | Health check (1=Up, 0=Down). | == 0 |

## 2. Grafana Dashboard Layout

### Row 1: Health & Performance
*   **Heartbeat**: Status indicator (Green/Red).
*   **Tick Latency**: Line graph. If this spikes, the server is lagging ("Rubberbanding").

### Row 2: Population
*   **Active Players**: Number of socket connections.
*   **Players per Zone**: Bar chart (requires tagging metric by `zone_id`).

### Row 3: Network
*   **Traffic**: In/Out Packet rate. High Out bound means heavy scene (lots of moving mobs).

## 3. Integration

The server exposes `GET /metrics`.
Prometheus scrapes this URL every 5 seconds.
Grafana reads from Prometheus to visualize.
