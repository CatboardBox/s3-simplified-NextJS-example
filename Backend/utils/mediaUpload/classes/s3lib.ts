import {CreateBucketCommand, DeleteBucketCommand, HeadBucketCommand, ListBucketsCommand, S3} from "@aws-sdk/client-s3";
import {S3Bucket} from "./s3Bucket";
import BucketNameValidator from "../validators/BucketNameValidator";

export class S3Lib {
    private readonly s3: S3;
    private readonly getBucketUrl: (bucketName: string) => string;

    constructor(region: Regions, accessKeyId: string, secretAccessKey: string) {
        this.s3 = new S3({region, credentials: {accessKeyId, secretAccessKey}});
        this.getBucketUrl = (bucketName: string) => {
            return `https://${bucketName}.s3.${region}.amazonaws.com`;
        }
    }

    public async createBucket(bucketName: string): Promise<S3Bucket> {
        console.log("Creating bucket: " + bucketName);
        const nameValid = await BucketNameValidator.validateAsync(bucketName)
        if (!nameValid) return Promise.reject(new Error("Invalid bucket name: " + bucketName));
        const command = new CreateBucketCommand({Bucket: bucketName});
        await this.s3.send(command);
        return new S3Bucket(this.s3,this.getBucketUrl(bucketName), bucketName);
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
    public async getBucket(bucketName: string): Promise<S3Bucket> {
        if (await this.containsBucket(bucketName)) {
            return this.getBucketNoChecks(bucketName);
        }
    }

    public async getOrCreateBucket(bucketName: string): Promise<S3Bucket> {
        if (await this.containsBucket(bucketName)) {
            console.log("Get or creating bucket: " + bucketName + " (Get)")
            return this.getBucketNoChecks(bucketName);
        }
        console.log("Get or creating bucket: " + bucketName + " (Create)")
        return this.createBucket(bucketName);
    }

    private getBucketNoChecks(bucketName: string): S3Bucket {
        return new S3Bucket(this.s3, this.getBucketUrl(bucketName), bucketName);
    }

    async containsBucket(bucketName: string): Promise<boolean> {
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

//https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-regions
type Regions =
    "us-east-2" |
    "us-east-1" |
    "us-west-1" |
    "us-west-2" |
    "af-south-1" |
    "ap-east-1" |
    "ap-south-2" |
    "ap-southeast-3" |
    "ap-southeast-4" |
    "ap-south-1" |
    "ap-northeast-3" |
    "ap-northeast-2" |
    "ap-southeast-1" |
    "ap-southeast-2" |
    "ap-northeast-1" |
    "ca-central-1" |
    "eu-central-1" |
    "eu-west-1" |
    "eu-west-2" |
    "eu-south-1" |
    "eu-west-3" |
    "eu-south-2" |
    "eu-north-1" |
    "eu-central-2" |
    "me-south-1" |
    "me-central-1" |
    "sa-east-1"
