import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutBucketPolicyCommand,
    PutObjectCommand,
    S3
} from "@aws-sdk/client-s3";
import {Readable} from "stream";
import {S3Object} from "./s3Object";
import {Metadata} from "./metadata";

export class S3Bucket {
    private s3: S3;
    private readonly bucketName: string;
    private readonly getPublicUrlNoCheck: (key: string) => string;

    /**
     * @internal
     * @param s3
     * @param stringUrl
     * @param bucketName
     */
    constructor(s3: S3, stringUrl: string, bucketName: string) {
        this.s3 = s3;
        this.bucketName = bucketName;
        this.getPublicUrlNoCheck = (key: string) => {
            return `${stringUrl}/${key}`;
        }
    }

    async createObject(s3Object: S3Object): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Object.FileName,
            Body: s3Object.data,
            Metadata: s3Object.metadata.asRecord()
        });
        await this.s3.send(command);
    }

    async getObject(key: string): Promise<S3Object> {
        const command = new GetObjectCommand({Bucket: this.bucketName, Key: key});
        const response = await this.s3.send(command);
        return new S3Object(response.Body as Readable, new Metadata(response.Metadata));
    }

    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({Bucket: this.bucketName, Key: key});
        await this.s3.send(command);
    }

    async listObjects(): Promise<Array<string>> {
        const command = new ListObjectsV2Command({Bucket: this.bucketName});
        const response = await this.s3.send(command);
        return response.Contents ?
            // if response.Contents is not null, then map the array to get the keys
            response.Contents.map(content => content.Key || "[unknown]")
            // if response.Contents is null, then return an empty array
            : [];
    }

    async listObjectsUrls(): Promise<Array<string>> {
        const objects = await this.listObjects();
        return objects.map(object => this.getPublicUrlNoCheck(object));
    }

    //todo
    async changeAccessPolicy(): Promise<void> {
        throw new Error("Not implemented");
    }

    /**
     * Makes the bucket public by setting the bucket policy to allow public read access.
     * @deprecated this is for testing only
     */
    //todo remove this
    async makeBucketPublic(): Promise<void> {
        const publicReadPolicy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicRead",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${this.bucketName}/*`,
                },
            ],
        };

        const command = new PutBucketPolicyCommand({
            Bucket: this.bucketName,
            Policy: JSON.stringify(publicReadPolicy),
        });

        await this.s3.send(command);
    }

    async containsObject(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({Bucket: this.bucketName, Key: key});
            await this.s3.send(command);
            return true;
        } catch (error) {
            if (error.name === "NotFound") return false;
            throw error;
        }
    }


    async getPublicUrl(key: string): Promise<string> {
        //check if key exists
        if (!await this.containsObject(key))
            throw new Error(`Object with key ${key} does not exist in bucket ${this.bucketName}`);

        return this.getPublicUrlNoCheck(key);
    }
}
