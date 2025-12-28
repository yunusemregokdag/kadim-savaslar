
/**
 * Simple Prometheus-compatible metric types.
 * In a real app, use 'prom-client' library.
 */

export class Gauge {
    private value: number = 0;
    constructor(public name: string, public help: string) { }

    set(val: number) { this.value = val; }
    inc(val = 1) { this.value += val; }
    dec(val = 1) { this.value -= val; }
    get() { return this.value; }

    toString() {
        return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n${this.name} ${this.value}`;
    }
}

export class Counter {
    private value: number = 0;
    constructor(public name: string, public help: string) { }

    inc(val = 1) { this.value += val; }
    get() { return this.value; }

    toString() {
        return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n${this.name} ${this.value}`;
    }
}

export class Histogram {
    private buckets: number[] = [10, 20, 50, 100, 200, 500]; // ms
    private counts: number[] = new Array(6).fill(0);
    private sum = 0;
    private count = 0;

    constructor(public name: string, public help: string) { }

    observe(val: number) {
        this.sum += val;
        this.count++;
        for (let i = 0; i < this.buckets.length; i++) {
            if (val <= this.buckets[i]) {
                this.counts[i]++;
            }
        }
    }

    toString() {
        // Simplified Prometheus output
        return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} histogram\n${this.name}_sum ${this.sum}\n${this.name}_count ${this.count}`;
    }
}
