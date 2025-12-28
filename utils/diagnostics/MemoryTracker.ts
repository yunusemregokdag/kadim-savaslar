
export class MemoryTracker {
    public measurements: { time: number, heapUsed: number, heapTotal: number }[] = [];
    private initialHeap = 0;

    constructor() {
        const mem = (performance as any).memory;
        if (mem) {
            this.initialHeap = mem.usedJSHeapSize;
        }
    }

    public sample() {
        const mem = (performance as any).memory;
        if (!mem) return null;

        const snapshot = {
            time: Date.now(),
            heapUsed: mem.usedJSHeapSize,
            heapTotal: mem.totalJSHeapSize
        };

        this.measurements.push(snapshot);
        // Keep last 900 samples (15 mins if 1 sec sample)
        if (this.measurements.length > 900) this.measurements.shift();

        return snapshot;
    }

    public getGrowthRate() {
        if (this.measurements.length < 2) return 0;
        const start = this.measurements[0];
        const end = this.measurements[this.measurements.length - 1];

        // Bytes per second growth
        const durationSec = (end.time - start.time) / 1000;
        if (durationSec <= 0) return 0;

        return (end.heapUsed - start.heapUsed) / durationSec;
    }

    public detectLeak() {
        // Simple logic: Is trend consistently up?
        if (this.measurements.length < 10) return false;

        let upCount = 0;
        for (let i = 1; i < this.measurements.length; i++) {
            if (this.measurements[i].heapUsed > this.measurements[i - 1].heapUsed) {
                upCount++;
            }
        }

        // If 70% of samples show growth, suspicious
        return (upCount / this.measurements.length) > 0.7;
    }
}
