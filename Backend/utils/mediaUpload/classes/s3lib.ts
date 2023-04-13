import {CreateBucketCommand, DeleteBucketCommand, HeadBucketCommand, ListBucketsCommand, S3} from "@aws-sdk/client-s3";
import {S3Bucket} from "./s3Bucket";
import BucketNameValidator from "../utils/validators/BucketNameValidator";
import {IS3Bucket, S3Interface} from "../interfaces";
import {Regions} from "../types";
import {InvalidBucketName, MissingBucket} from "./Errors";
import config from "../config";

export class S3Lib implements S3Interface {
    private readonly s3: S3;
    private readonly getBucketUrlInternal: (bucketName: string) => string;

    constructor(region: Regions = config.region, accessKeyId: string = config.accessKeyId, secretAccessKey: string = config.secretAccessKey) {
        this.s3 = new S3({region, credentials: {accessKeyId, secretAccessKey}});
        this.getBucketUrlInternal = (bucketName: string) => `https://${bucketName}.s3.${region}.amazonaws.com`;
    }

    public async createBucket(bucketName: string): Promise<IS3Bucket> {
        console.log("Creating bucket: " + bucketName);
        const nameValid = await BucketNameValidator.validateAsync(bucketName)
        if (!nameValid) return Promise.reject(new InvalidBucketName(bucketName));
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

    public async getBucket(bucketName: string): Promise<IS3Bucket> {
        if (!await this.containsBucket(bucketName))
            throw new MissingBucket(bucketName)
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

    private getBucketInternal(bucketName: string): S3Bucket {
        return new S3Bucket(this.s3, this.getBucketUrlInternal(bucketName), bucketName);
    }

    public static readonly Default = new S3Lib();
}

