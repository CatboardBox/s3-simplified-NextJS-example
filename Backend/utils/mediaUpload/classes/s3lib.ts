import {CreateBucketCommand, DeleteBucketCommand, HeadBucketCommand, ListBucketsCommand, S3} from "@aws-sdk/client-s3";
import {S3Bucket} from "./s3Bucket";
import BucketNameValidator from "../utils/validators/BucketNameValidator";
import {IS3Bucket} from "../interfaces/IS3Bucket";
import {Regions} from "../types/regions";

export class S3Lib {
    private readonly s3: S3;
    private readonly getBucketUrlInternal: (bucketName: string) => string;

    constructor(region: Regions, accessKeyId: string, secretAccessKey: string) {
        this.s3 = new S3({region, credentials: {accessKeyId, secretAccessKey}});
        this.getBucketUrlInternal = (bucketName: string) => `https://${bucketName}.s3.${region}.amazonaws.com`;
    }

    private getBucketInternal(bucketName: string): S3Bucket {
        return new S3Bucket(this.s3, this.getBucketUrlInternal(bucketName), bucketName);
    }

    public async createBucket(bucketName: string): Promise<IS3Bucket> {
        console.log("Creating bucket: " + bucketName);
        const nameValid = await BucketNameValidator.validateAsync(bucketName)
        if (!nameValid) return Promise.reject(new Error("Invalid bucket name: " + bucketName));
        const command = new CreateBucketCommand({Bucket: bucketName});
        await this.s3.send(command);
        return new S3Bucket(this.s3, this.getBucketUrlInternal(bucketName), bucketName);
    }

    public async deleteBucket(bucketName: string): Promise<void> {
        const command = new DeleteBucketCommand({Bucket: bucketName});
        await this.s3.send(command);
    }

    public async listBuckets(): Promise<Array<string>> {
        const command = new ListBucketsCommand({});
        const response = await this.s3.send(command);
        return response.Buckets ?
            response.Buckets.map(bucket => bucket.Name || '[unknown]')
            : [];
    }


    /**
     * Returns an S3Bucket object for the given bucket name.
     * @param bucketName the name of the bucket
     * @returns an S3Bucket object for the given bucket name
     */
    public async getBucket(bucketName: string): Promise<IS3Bucket> {
        if (!await this.containsBucket(bucketName))
            throw new Error("Bucket does not exist: " + bucketName);
        return this.getBucketInternal(bucketName);

    }

    public async getOrCreateBucket(bucketName: string): Promise<IS3Bucket> {
        if (await this.containsBucket(bucketName))
            return this.getBucketInternal(bucketName);
        return this.createBucket(bucketName);
    }

    public async containsBucket(bucketName: string): Promise<boolean> {
        try {
            const command = new HeadBucketCommand({Bucket: bucketName});
            await this.s3.send(command);
            return true;
        } catch (error) {
            if (error.name === undefined || error.name !== "NoSuchBucket") throw error;
            return false;
        }
    }
}

