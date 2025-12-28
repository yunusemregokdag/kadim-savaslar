
import { FPSCounter } from './FPSCounter';
import { MemoryTracker } from './MemoryTracker';
import { GameLoopProfiler } from './GameLoopProfiler';
import { NetworkProfiler } from './NetworkProfiler';
import { RenderTracker } from './RenderTracker';
import { ReportGenerator } from './ReportGenerator';

export enum PerformanceIssue {
    NONE = "Normal",
    FPS_DECAY = "Gradual FPS Decay detected (Memory Leak Suspect)",
    FPS_COLLAPSE = "Sudden FPS Collapse (Critical Error/Infinite Loop)",
    MEMORY_LEAK = "JS Heap consistently growing without GC release",
    RENDER_BOTTLENECK = "High Entity Count causing Render Overload",
    NETWORK_STORM = "Network Packet Storm detected",
    CPU_BOUND = "Main Thread blocked by long tasks (CPU Bound)"
}

export interface PerfSnapshot {
    timestamp: number;
    fps: number;
    frameTime: number;
    heapUsed: number;
    entities: number;
    particles: number;
    packets: number;
    longTasks: number;
    stage: string;
}

class PerformanceMonitor {
    public fps: FPSCounter;
    public memory: MemoryTracker;
    public cpu: GameLoopProfiler;
    public net: NetworkProfiler;
    public render: RenderTracker;

    private isRunning = false;
    private sessionLog: PerfSnapshot[] = [];
    private currentStage = "Unknown";
    private startTime = 0;

    constructor() {
        this.fps = new FPSCounter();
        this.memory = new MemoryTracker();
        this.cpu = new GameLoopProfiler();
        this.net = new NetworkProfiler();
        this.render = new RenderTracker();
    }

    public start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.sessionLog = [];
        console.log("📊 Performance Monitor Started");

        // Start periodic sampling (every 1s)
        setInterval(() => this.sample(), 1000);

        // EXPOSE TO CONSOLE (Fix for "console commands not working")
        if (typeof window !== 'undefined') {
            (window as any).generatePerfReport = () => this.stopAndGenerateReport();
            (window as any).monitor = this;
            console.log("👉 Console Access: Type 'generatePerfReport()' or 'monitor' to inspect.");
        }
    }

    public stopAndGenerateReport() {
        this.isRunning = false;
        console.log("🛑 Performance Monitor Stopped");

        const report = ReportGenerator.generate(this.sessionLog, this.startTime);

        // In a real app, you might download this file
        console.log(report);

        return report;
    }

    public setStage(stage: string) {
        this.currentStage = stage;
    }

    // Must be called every frame
    public tickFrame(now: number) {
        if (!this.isRunning) return;
        this.fps.tick(now);
    }

    // Profiling Hooks
    public beginLoop() { this.cpu.begin(); }
    public endLoop() { this.cpu.end(); }
    public onPacket(size: number) { this.net.onPacket(size); }
    public onEntityUpdate() { this.net.onEntityUpdate(); }
    public updateRenderStats(entities: number, particles: number) {
        this.render.update(entities, particles, 0);
    }

    private sample() {
        if (!this.isRunning) return;

        const fpsSnap = this.fps.getSnapshot();
        const memSnap = this.memory.sample();
        const cpuSnap = this.cpu.getStats();
        const netSnap = this.net.tickSecond();
        const renderSnap = this.render.getSnapshot();

        const snapshot: PerfSnapshot = {
            timestamp: Date.now(),
            fps: fpsSnap.current,
            frameTime: fpsSnap.lastFrameTime,
            heapUsed: memSnap ? memSnap.heapUsed : 0,
            entities: renderSnap.entities,
            particles: renderSnap.particles,
            packets: netSnap.pps,
            longTasks: cpuSnap.longTasks,
            stage: this.currentStage
        };

        this.sessionLog.push(snapshot);

        // Live alert for developers
        if (fpsSnap.current < 20 && this.sessionLog.length > 10) {
            console.warn(`⚠️ Low FPS Detected: ${fpsSnap.current}`);
        }
    }

    public getLog() {
        return this.sessionLog;
    }
}

export const monitor = new PerformanceMonitor();
