
export class FPSCounter {
    private frames = 0;
    private lastTime = 0;
    private frameTimes: number[] = [];
    private fpsHistory: number[] = [];
    private lastFpsUpdate = 0;

    // Metrics
    public currentFps = 0;
    public avgFps = 0;
    public minFps = 999;
    public maxFps = 0;
    public stutterCount = 0; // > 50ms frames

    constructor() {
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;
    }

    public tick(now: number) {
        this.frames++;
        const delta = now - this.lastTime;

        if (delta > 0) {
            this.frameTimes.push(delta);
            if (delta > 50) this.stutterCount++; // 50ms = 20 FPS dip (visual stutter)
        }

        this.lastTime = now;

        // Update FPS every second
        if (now - this.lastFpsUpdate >= 1000) {
            this.currentFps = this.frames;
            this.fpsHistory.push(this.currentFps);

            // Calc stats
            this.minFps = Math.min(this.minFps, this.currentFps);
            this.maxFps = Math.max(this.maxFps, this.currentFps);
            this.avgFps = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);

            // Cleanup
            this.frames = 0;
            this.lastFpsUpdate = now;

            // Keep history manageable (last 15 mins = 900 seconds)
            if (this.fpsHistory.length > 900) this.fpsHistory.shift();
            // Keep frame times for analysis (last 1000 frames)
            if (this.frameTimes.length > 1000) this.frameTimes = this.frameTimes.slice(-1000);
        }
    }

    public getSnapshot() {
        return {
            current: this.currentFps,
            avg: this.avgFps,
            min: this.minFps,
            max: this.maxFps,
            stutters: this.stutterCount,
            lastFrameTime: this.frameTimes[this.frameTimes.length - 1] || 0
        };
    }

    public getHistory() {
        return [...this.fpsHistory];
    }
}
