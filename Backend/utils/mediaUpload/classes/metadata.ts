export class Metadata {
    constructor(private metadata: { [key: string]: string } = {}) {
    }

    public getMetadata(key: string): string | undefined {
        return this.metadata[key];
    }

    public setMetadata(key: string, value: string): void {
        this.metadata[key] = value;
    }

    public getMetadataKeys(): string[] {
        return Object.keys(this.metadata);
    }

    public getMetadataValues(): string[] {
        return Object.values(this.metadata);
    }

    public getMetadataEntries(): [string, string][] {
        return Object.entries(this.metadata);
    }

    public getMetadataSize(): number {
        return this.getMetadataKeys().length;
    }

    public hasMetadata(): boolean {
        return this.getMetadataSize() > 0;
    }

    public hasMetadataKey(key: string): boolean {
        return this.getMetadataKeys().includes(key);
    }

    public hasMetadataValue(value: string): boolean {
        return this.getMetadataValues().includes(value);
    }

    public hasMetadataEntry(entry: [string, string]): boolean {
        return this.getMetadataEntries().includes(entry);
    }

    public deleteMetadata(key: string): void {
        delete this.metadata[key];
    }

    public deleteAllMetadata(): void {
        this.metadata = {};
    }

    public asRecord(): Record<string, string> {
        const record: Record<string, string> = {};
        for (const key in this) {
            if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
            record[key] = String(this[key]);
        }
        return record;
    }
}

