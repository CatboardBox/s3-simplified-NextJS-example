export class URL {
    private url: string = "";

    constructor(url: string) {
        this.value = url;
    }

    public get value(): string {
        return this.url;
    }

    public set value(value: string) {
        this.url = value;
    }

    public get valid(): boolean {
        return this.url.length > 0;
    }
}
