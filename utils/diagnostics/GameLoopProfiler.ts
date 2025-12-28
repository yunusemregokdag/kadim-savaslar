
export class GameLoopProfiler {
    private lastTick = 0;
    private longTasks = 0;
    private budgetExceeded = 0;
    private durations: number[] = [];

    // Target: 60 FPS -> 16.6ms budget
    private readonly FRAME_BUDGET = 16.6;

    public begin() {
        this.lastTick = performance.now();
    }

    public end() {
        const now = performance.now();
        const duration = now - this.lastTick;

        if (duration > this.FRAME_BUDGET) {
            this.budgetExceeded++;
        }
        if (duration > 50) {
            this.longTasks++; // Major blocking task
        }

        this.durations.push(duration);
        if (this.durations.length > 1000) this.durations.shift();
    }

    public getStats() {
        const avg = this.durations.length > 0
            ? this.durations.reduce((a, b) => a + b, 0) / this.durations.length
            : 0;

        return {
            avgDuration: avg,
            longTasks: this.longTasks,
            budgetBreaches: this.budgetExceeded
        };
    }
}
