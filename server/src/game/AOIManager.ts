
export class AOIManager {
    private cellSize: number = 50; // Grid cell size in world units
    private grid: Map<string, Set<string>> = new Map();
    private entityMap: Map<string, string> = new Map(); // Cache entity->cell

    private getKey(x: number, y: number): string {
        return `${Math.floor(x / this.cellSize)}:${Math.floor(y / this.cellSize)}`;
    }

    public update(id: string, x: number, y: number) {
        const contextKey = this.getKey(x, y);
        const oldKey = this.entityMap.get(id);

        if (contextKey !== oldKey) {
            // Remove from old
            if (oldKey) this.grid.get(oldKey)?.delete(id);

            // Add to new
            if (!this.grid.has(contextKey)) this.grid.set(contextKey, new Set());
            this.grid.get(contextKey)!.add(id);

            this.entityMap.set(id, contextKey);
        }
    }

    public remove(id: string) {
        const key = this.entityMap.get(id);
        if (key) {
            this.grid.get(key)?.delete(id);
            this.entityMap.delete(id);
        }
    }

    // Core AOI Logic: Moore Neighborhood (Current + 8 Neighbors)
    public getInterestSet(x: number, y: number): string[] {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        const entities: string[] = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const key = `${cx + dx}:${cy + dy}`;
                const cell = this.grid.get(key);
                if (cell) {
                    for (const id of cell) entities.push(id);
                }
            }
        }
        return entities;
    }
}
