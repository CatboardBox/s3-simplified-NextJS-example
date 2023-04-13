export interface IMetadata {

    /**
     * Gets the value for the given key.
     * @param key the key
     * @returns the value for the given key
     */
    get(key: string): string | undefined

    /**
     * Gets all keys.
     */
    get Keys(): string[]

    /**
     * Gets all values.
     */
    get Values(): string[]

    /**
     * Gets all key-value pairs.
     */
    get Pairs(): [string, string][]

    /**
     * Returns the number of key-value pairs.
     **/
    Length(): number

    /**
     * Checks if the metadata is empty.
     * @returns true if the metadata is empty, false otherwise
     */
    isEmpty(): boolean

    /**
     * Checks if the metadata contains the given key.
     * @param key the key
     */
    containsKey(key: string): boolean

    /**
     * Checks if the metadata contains the given value.
     * @param value the value
     */
    containsValue(value: string): boolean

    /**
     * Checks if the metadata contains the given key-value pair.
     * @param entry the key-value pair
     */
    contains(entry: [string, string]): boolean

    /**
     * Copies the metadata to a record.
     * @returns a record containing the metadata
     */
    toRecord(): Record<string, string>

    /**
     * Returns the metadata as a record.
     */
    asRecord(): Record<string, string>
}
