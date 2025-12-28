
export class RenderTracker {
    public entityCount = 0;
    public drawCalls = 0; // Estimated or retrieved if supported
    public activeParticles = 0;

    public update(entities: number, particles: number, estimatedDrawCalls: number) {
        this.entityCount = entities;
        this.activeParticles = particles;
        this.drawCalls = estimatedDrawCalls;
    }

    public getSnapshot() {
        return {
            entities: this.entityCount,
            particles: this.activeParticles,
            drawCalls: this.drawCalls
        };
    }
}
