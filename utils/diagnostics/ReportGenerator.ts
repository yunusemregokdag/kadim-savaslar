
import { PerfSnapshot, PerformanceIssue } from './PerformanceMonitor';

export class ReportGenerator {
    public static generate(log: PerfSnapshot[], sessionStart: number): string {
        if (log.length === 0) return "No data collected.";

        const durationMinutes = (Date.now() - sessionStart) / 1000 / 60;
        const avgFps = Math.round(log.reduce((a, b) => a + b.fps, 0) / log.length);
        const minFps = Math.min(...log.map(x => x.fps));
        const startMem = log[0].heapUsed / 1024 / 1024; // MB
        const endMem = log[log.length - 1].heapUsed / 1024 / 1024; // MB

        // Diagnosis
        const diagnosis = this.diagnose(log);

        let report = `
==================================================
📊 KADİM SAVAŞLAR - PERFORMANCE DIAGNOSTIC REPORT
==================================================
Session Duration: ${durationMinutes.toFixed(2)} mins
Total Samples: ${log.length}

SUMMARY:
• Avg FPS: ${avgFps}
• Min FPS: ${minFps}
• Memory Delta: ${startMem.toFixed(2)} MB -> ${endMem.toFixed(2)} MB
• Max Entities: ${Math.max(...log.map(x => x.entities))}

🩺 DIAGNOSIS: ${diagnosis.issue}
Confident: ${diagnosis.confidence}%
Primary Suspect: ${diagnosis.suspect}

TIMELINE ANALYSIS:
`;

        // Split into chunks of 5 mins (300 seconds)
        const chunkSize = 300;
        for (let i = 0; i < log.length; i += chunkSize) {
            const chunk = log.slice(i, i + chunkSize);
            const chunkMin = i / 60;
            const chunkMax = (i + chunkSize) / 60;
            const cAvgFps = Math.round(chunk.reduce((a, b) => a + b.fps, 0) / chunk.length);
            const cMemGrowth = (chunk[chunk.length - 1].heapUsed - chunk[0].heapUsed) / 1024 / 1024;

            report += `[Min ${chunkMin.toFixed(0)}-${chunkMax.toFixed(0)}]: FPS Avg: ${cAvgFps} | Mem: ${cMemGrowth > 0 ? '+' : ''}${cMemGrowth.toFixed(1)}MB | Ent: ${chunk[0].entities}\n`;
        }

        report += `
==================================================
🛑 ROOT CAUSE ANALYSIS & FIXES
==================================================
`;

        report += this.getFixRecommendation(diagnosis.issue);

        return report;
    }

    private static diagnose(log: PerfSnapshot[]): { issue: PerformanceIssue, confidence: number, suspect: string } {
        // 1. Detect Decay (Memory Leak vs Entity Creep)
        const firstHalf = log.slice(0, Math.floor(log.length / 2));
        const secondHalf = log.slice(Math.floor(log.length / 2));

        const fps1 = firstHalf.reduce((a, b) => a + b.fps, 0) / firstHalf.length;
        const fps2 = secondHalf.reduce((a, b) => a + b.fps, 0) / secondHalf.length;

        // Is FPS dropping?
        if (fps1 - fps2 > 10) { // Significant drop
            const memStart = firstHalf[0].heapUsed;
            const memEnd = secondHalf[secondHalf.length - 1].heapUsed;

            // Check if Memory Leaked
            if (memEnd > memStart * 1.5) {
                return { issue: PerformanceIssue.MEMORY_LEAK, confidence: 90, suspect: "Memory not being released" };
            }

            // Check if Entities Increased
            const entStart = firstHalf[0].entities;
            const entEnd = secondHalf[secondHalf.length - 1].entities;
            if (entEnd > entStart * 1.5) {
                return { issue: PerformanceIssue.RENDER_BOTTLENECK, confidence: 95, suspect: "Entity count doubling (Spawn logic?)" };
            }

            return { issue: PerformanceIssue.FPS_DECAY, confidence: 70, suspect: "Unknown gradual degradation" };
        }

        // Is it CPU Bound?
        const longTasks = log.filter(x => x.longTasks > 0).length;
        if (longTasks > log.length * 0.2) { // 20% of time has long tasks
            return { issue: PerformanceIssue.CPU_BOUND, confidence: 85, suspect: "Heavy Game Loop / Physics / AI" };
        }

        return { issue: PerformanceIssue.NONE, confidence: 100, suspect: "None" };
    }

    private static getFixRecommendation(issue: PerformanceIssue): string {
        switch (issue) {
            case PerformanceIssue.MEMORY_LEAK:
                return `
[!] MEMORY LEAK DETECTED
Probable Cause: objects, event listeners, or closures are retaining memory.
Fix Strategy:
1. Check 'useEffect' cleanups in ActiveZoneView.
2. Ensure 'entities' map deletes keys when mobs die.
3. Check WebSocket listeners are removed on unmount.
4. Use Chrome Memory Snapshot comparison (Snapshot 1 vs Snapshot 2).
`;
            case PerformanceIssue.RENDER_BOTTLENECK:
                return `
[!] RENDER OVERLOAD DETECTED
Probable Cause: Too many high-poly meshes or draw calls.
Fix Strategy:
1. Implement Frustum Culling (don't render what is behind camera).
2. Use InstancedMesh for mobs if they share geometry.
3. Reduce particle count on low-end devices.
4. Check if 'mob spawning' logic has a cap (MAX_MOBS).
`;
            case PerformanceIssue.CPU_BOUND:
                return `
[!] MAIN THREAD BLOCKED
Probable Cause: Heavy calculations in Game Loop.
Fix Strategy:
1. Move Physics/Pathfinding to WebWorker.
2. Reduce frequency of 'findNearestTarget' checks (throttle to 200ms).
3. Optimize 'ActiveZoneView' loop logic.
`;
            default:
                return "Performance looks stable. No critical fixes needed.";
        }
    }
}
