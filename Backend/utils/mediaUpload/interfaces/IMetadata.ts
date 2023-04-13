export interface IMetadata {

    get(key: string): string | undefined

    get Keys(): string[]

    get Values(): string[]

    get Pairs(): [string, string][]

    Length(): number

    isEmpty(): boolean

    containsKey(key: string): boolean

    containsValue(value: string): boolean

    contains(entry: [string, string]): boolean

    toRecord(): Record<string, string>

    asRecord(): Record<string, string>
}
