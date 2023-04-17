export interface ApiData {

    /**
     * The URL of the S3 object.
     * @type {string | undefined}
     */
    FileLink: string | undefined,

    /**
     * The metadata associated with the S3 object, as an array of key-value pairs.
     * @type {[string, string][]}
     */
    Metadata: [string, string][],
}

