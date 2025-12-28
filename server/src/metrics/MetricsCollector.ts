
import { Gauge, Counter, Histogram } from './prometheus';

export class MetricsCollector {
    // Singletons
    public static readonly TickDuration = new Histogram('game_tick_duration_ms', 'Time spent in game loop');
    public static readonly ActivePlayers = new Gauge('game_active_players', 'Number of players currently connected');
    public static readonly PacketsIn = new Counter('net_packets_in_total', 'Total packets received');
    public static readonly PacketsOut = new Counter('net_packets_out_total', 'Total packets sent');
    public static readonly BossCpuUsage = new Gauge('game_boss_cpu_usage_pct', 'CPU usage for World Boss logic');
    public static readonly ShardHeartbeat = new Gauge('shard_status', '1 = Online, 0 = Offline');

    /**
     * Call this at the end of every game tick
     */
    public static recordTick(startMs: number) {
        const duration = Date.now() - startMs;
        this.TickDuration.observe(duration);
    }

    /**
     * Formats all metrics for /metrics endpoint
     */
    public static scrape(): string {
        return [
            this.TickDuration.toString(),
            this.ActivePlayers.toString(),
            this.PacketsIn.toString(),
            this.PacketsOut.toString(),
            this.BossCpuUsage.toString(),
            this.ShardHeartbeat.toString()
        ].join('\n\n');
    }
}
