import {CreateBucketCommand, DeleteBucketCommand, HeadBucketCommand, ListBucketsCommand, S3} from "@aws-sdk/client-s3";
import {S3Bucket} from "../buckets/s3Bucket";
import {IS3, S3BucketService} from "../../interfaces";
import {Regions} from "../../types";
import {InvalidBucketName, MissingBucket} from "./errors";
import config from "../../configTemplate";

export class S3Lib implements IS3 {
    public static readonly Default: IS3 = new S3Lib();
    public readonly s3: S3;
    public readonly region: Regions;

    constructor(region: Regions = config.region, accessKeyId: string = config.accessKey.id, secretAccessKey: string = config.accessKey.secret) {
        this.s3 = new S3({region, credentials: {accessKeyId, secretAccessKey}});
        this.region = region;
    }

    public async createBucket(bucketName: string): Promise<S3BucketService> {
        console.log("Creating bucket: " + bucketName);
        //Naming rules
        // https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html

        //Define Rules (rules below have more restrictions than the ones listed in the link above e.g. periods are allowed but not recommended for optimal performance, so they're simply not allowed here)
        if (!(bucketName.length >= 3 && bucketName.length <= 63))
            throw new InvalidBucketName(bucketName, `${bucketName} must be between 3 and 63 characters long`);
        if (!(/^[a-z0-9]/.test(bucketName)))
            throw new InvalidBucketName(bucketName, `${bucketName} must start with a letter or number`);
        if (!(/[a-z0-9]$/.test(bucketName)))
            throw new InvalidBucketName(bucketName, `${bucketName} must end with a letter or number`);
        if (bucketName.includes('.') || bucketName.includes('_'))
            throw new InvalidBucketName(bucketName, `${bucketName} must not contain "." or "_"`);
        if (bucketName !== bucketName.toLowerCase())
            throw new InvalidBucketName(bucketName, `${bucketName} must not contain any uppercase characters`);
        if (bucketName.endsWith('-s3alias') || bucketName.endsWith('--ol-s3'))
            throw new InvalidBucketName(bucketName, `${bucketName} must not end with be -s3alias or --ol-s3`);
        if (bucketName.startsWith('xn--'))
            throw new InvalidBucketName(bucketName, `${bucketName} must not start with be xn--`);

        const command = new CreateBucketCommand({Bucket: bucketName});
        await this.s3.send(command);
        return this.getBucketInternal(bucketName);
    }

    public async deleteBucket(bucketName: string): Promise<void> {
        if (!await this.containsBucket(bucketName))
            throw new MissingBucket(bucketName)
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

    public async getBucket(bucketName: string): Promise<S3BucketService> {
        if (!await this.containsBucket(bucketName))
            throw new MissingBucket(bucketName)
        return this.getBucketInternal(bucketName);

    }

    public async getOrCreateBucket(bucketName: string): Promise<S3BucketService> {
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
        return new S3Bucket(this, bucketName);
    }
}

