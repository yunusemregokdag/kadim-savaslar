
export class NetworkProfiler {
    private packetsReceived = 0;
    private bytesReceived = 0;
    private updatesProcessed = 0;

    // History
    private packetRateHistory: number[] = [];

    // Call this whenever a socket message arrives
    public onPacket(sizeBytes: number = 0) {
        this.packetsReceived++;
        this.bytesReceived += sizeBytes;
    }

    // Call this whenever an entity update is processed
    public onEntityUpdate() {
        this.updatesProcessed++;
    }

    public tickSecond() {
        this.packetRateHistory.push(this.packetsReceived);

        // Reset counters for next second
        const snapshot = {
            pps: this.packetsReceived,
            bps: this.bytesReceived,
            ups: this.updatesProcessed // Updates per second
        };

        this.packetsReceived = 0;
        this.bytesReceived = 0;
        this.updatesProcessed = 0;

        if (this.packetRateHistory.length > 900) this.packetRateHistory.shift();

        return snapshot;
    }
}
