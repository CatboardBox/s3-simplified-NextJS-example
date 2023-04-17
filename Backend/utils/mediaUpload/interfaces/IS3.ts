import {S3BucketService} from "./S3BucketService";

/**
 * An interface for interacting with Amazon S3.
 */
export interface IS3 {

    /**
     * Creates a new bucket with the given name.
     * @param {string} bucketName - The name of the bucket to create.
     * @returns {Promise<S3BucketService>} A promise that resolves to a new S3BucketService object for the created bucket.
     */
    createBucket(bucketName: string): Promise<S3BucketService>

    /**
     * Deletes the bucket with the given name.
     * @param {string} bucketName - The name of the bucket to delete.
     * @returns {Promise<void>} A promise that resolves when the bucket is deleted.
     */
    deleteBucket(bucketName: string): Promise<void>

    /**
     * Lists all buckets.
     * @returns {Promise<Array<string>>} A promise that resolves to an array of all bucket names.
     */
    listBuckets(): Promise<Array<string>>

    /**
     * Returns an S3BucketService object for the given bucket name.
     * @param {string} bucketName - The name of the bucket.
     * @returns {Promise<S3BucketService>} A promise that resolves to an S3BucketService object for the given bucket name.
     * @throws {Error} An error is thrown if the bucket does not exist.
     */
    getBucket(bucketName: string): Promise<S3BucketService>

    /**
     * Returns an S3BucketService object for the given bucket name.
     * If the bucket does not exist, it will be created.
     * @param {string} bucketName - The name of the bucket.
     * @returns {Promise<S3BucketService>} A promise that resolves to an S3BucketService object for the given bucket name.
     */
    getOrCreateBucket(bucketName: string): Promise<S3BucketService>

    /**
     * Checks if the bucket with the given name exists.
     * @param {string} bucketName - The name of the bucket to check.
     * @returns {Promise<boolean>} A promise that resolves to true if the bucket exists, false otherwise.
     */
    containsBucket(bucketName: string): Promise<boolean>
}
