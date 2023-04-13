import {IS3Bucket} from "./IS3Bucket";

export interface S3Interface {

    /**
     * Creates a new bucket with the given name.
     * @param bucketName the name of the bucket
     */
    createBucket(bucketName: string): Promise<IS3Bucket>

    /**
     * Deletes the bucket with the given name.
     * @param bucketName the name of the bucket
     */
    deleteBucket(bucketName: string): Promise<void>

    /**
     * Lists all buckets.
     */
    listBuckets(): Promise<Array<string>>

    /**
     * Returns an S3Bucket object for the given bucket name.
     * @param bucketName the name of the bucket
     * @returns an S3Bucket object for the given bucket name
     * @throws an error if the bucket does not exist
     */
    getBucket(bucketName: string): Promise<IS3Bucket>

    /**
     * Returns an S3Bucket object for the given bucket name.
     * If the bucket does not exist, it will be created.
     * @param bucketName
     */
    getOrCreateBucket(bucketName: string): Promise<IS3Bucket>

    /**
     * Checks if the bucket with the given name exists.
     * @param bucketName the name of the bucket
     * @returns true if the bucket exists, false otherwise
     */
    containsBucket(bucketName: string): Promise<boolean>
}
