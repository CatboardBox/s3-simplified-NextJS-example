import {
    CompleteMultipartUploadCommand,
    CopyObjectCommand,
    CreateMultipartUploadCommand,
    DeleteObjectCommand,
    GetBucketAclCommand,
    GetBucketPolicyCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3,
    UploadPartCommand,
    UploadPartCommandOutput
} from "@aws-sdk/client-s3";
import {S3Object} from "./s3Object";
import {Metadata} from "./Metadata";
import {IS3Object} from "../interfaces";
import config from "../config";
import {S3Lib} from "./s3lib";
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {S3ObjectBuilder} from "./s3ObjectBuilder";
import {Readable} from "stream";

/**
 * An unsafe version of S3 bucket with no validation.
 */
export class S3BucketInternal {
    //s3
    private readonly s3: S3;

    //cached
    private isPublic_cache?: boolean;

    //bucket info
    public readonly bucketName: string;
    public readonly bucketUrl: string;


    /**
     * @internal
     * @param lib
     * @param bucketName
     */
    public constructor(lib: S3Lib, bucketName: string) {
        this.s3 = lib.s3;
        this.bucketUrl = `https://${bucketName}.s3.${lib.region}.amazonaws.com`;
        this.bucketName = bucketName;
    }


    private static async IsPublic_Internal(bucket: S3BucketInternal): Promise<boolean> {
        const aclResponse = await bucket.getBucketACL();

        for (const grant of aclResponse.Grants || []) {
            if ((grant.Grantee.URI === "http://acs.amazonaws.com/groups/global/AllUsers" || grant.Grantee.URI === "http://acs.amazonaws.com/groups/global/AuthenticatedUsers")
                && (grant.Permission === "READ" || grant.Permission === "FULL_CONTROL")) {
                return true;
            }
        }

        try {

            const policyResponse = await bucket.getBucketPolicies();
            const policy = JSON.parse(policyResponse.Policy);

            for (const statement of policy.Statement) {
                if (statement.Effect === "Allow" && statement.Principal === "*") {
                    if (Array.isArray(statement.Action)) {
                        for (const action of statement.Action) {
                            if (action === "s3:GetObject" || action === "s3:*") {
                                return true;
                            }
                        }
                    } else if (typeof statement.Action === "string" && (statement.Action === "s3:GetObject" || statement.Action === "s3:*")) {
                        return true;
                    }
                }
            }
        } catch (error) {
            if (error.name !== "NoSuchBucketPolicy") {
                throw error;
            }
        }
        return false;
    }


    public async isPublic(): Promise<boolean> {
        if (this.isPublic_cache === undefined) this.isPublic_cache = await S3BucketInternal.IsPublic_Internal(this);
        return this.isPublic_cache;
    }

    public async generateSignedUrl(key: string): Promise<string> {
        return getSignedUrl(this.s3, new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        }), {expiresIn: config.signedUrlExpiration});
    }

    public generatePublicUrl(key: string): string {
        return `${this.bucketUrl}/${key}`;
    }

    public async createObject_Single(s3ObjectBuilder: S3ObjectBuilder): Promise<IS3Object> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3ObjectBuilder.FileName,
            Body: s3ObjectBuilder.Body,
            Metadata: s3ObjectBuilder.Metadata.toRecord()
        });
        await this.s3.send(command);
        return new S3Object(s3ObjectBuilder.Metadata, this);
    }

    public async createObject_Multipart(s3ObjectBuilder: S3ObjectBuilder): Promise<IS3Object> {
        // Multipart upload
        console.log("Using multipart upload")

        console.log(s3ObjectBuilder.FileName);
        const createMultipartUploadCommand = new CreateMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: s3ObjectBuilder.FileName,
            Metadata: s3ObjectBuilder.Metadata.toRecord()
        });
        const createMultipartUploadResponse = await this.s3.send(createMultipartUploadCommand);
        const uploadId = createMultipartUploadResponse.UploadId;
        if (!uploadId) throw new Error("Failed to initialize multipart upload");

        const partSize = config.multipartChunkSize;
        const partsCount = Math.ceil(s3ObjectBuilder.DataSize / partSize);

        console.log(`Uploading ${partsCount} parts...`)

        console.log(s3ObjectBuilder.FileName);
        //Consolidate all the promises into one array and await them all at once rather than one by one
        const promises = new Array<Promise<UploadPartCommandOutput>>(partsCount);
        for (let i = 0; i < partsCount; i++) {
            console.log(`Uploading part ${i + 1} of ${partsCount}`)
            const start = i * partSize;
            const end = Math.min(start + partSize, s3ObjectBuilder.DataSize);
            const partBuffer = (await s3ObjectBuilder.AsBuffer()).slice(start, end);

            const uploadPartCommand = new UploadPartCommand({
                Bucket: this.bucketName,
                Key: s3ObjectBuilder.FileName,
                UploadId: uploadId,
                PartNumber: i + 1,
                Body: partBuffer
            });
            promises[i] = this.s3.send(uploadPartCommand);
        }
        const uploadPartResponses = await Promise.all(promises);
        const completedParts = uploadPartResponses.map((response, index) => {
            return {
                ETag: response.ETag,
                PartNumber: index + 1
            }
        });
        console.log("Completing multipart upload...")

        console.log(s3ObjectBuilder.FileName);
        const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: s3ObjectBuilder.FileName,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: completedParts
            }
        });
        await this.s3.send(completeMultipartUploadCommand);
        console.log("Multipart upload complete");
        return new S3Object(s3ObjectBuilder.Metadata, this);
    }

    public async getBucketACL() {
        const aclCommand = new GetBucketAclCommand({
            Bucket: this.bucketName,
        });
        return this.s3.send(aclCommand);
    }

    public async getBucketPolicies() {
        const policyCommand = new GetBucketPolicyCommand({
            Bucket: this.bucketName
        });

        return this.s3.send(policyCommand);
    }

    public async getObject(key: string, requireBody = false): Promise<IS3Object> {
        const command = new GetObjectCommand({Bucket: this.bucketName, Key: key});
        const response = await this.s3.send(command);
        return requireBody ?
            new S3Object(new Metadata(response.Metadata), this, response.Body as Readable) :
            new S3Object(new Metadata(response.Metadata), this);
    }

    public async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({Bucket: this.bucketName, Key: key});
        await this.s3.send(command);
    }

    public async renameObject(oldKey: string, newKey: string): Promise<void> {
        const copyCommand = new CopyObjectCommand({
            Bucket: this.bucketName,
            CopySource: `${this.bucketName}/${encodeURIComponent(oldKey)}`,
            Key: newKey
        });

        await this.s3.send(copyCommand);

        await this.deleteObject(oldKey);
    }

    public async listContents(): Promise<Array<string>> {
        const command = new ListObjectsV2Command({Bucket: this.bucketName});
        const response = await this.s3.send(command);
        // if response.Contents is not null, then map the array to get the keys
        // else return an empty array
        return response.Contents ? response.Contents.map(content => content.Key || "[unknown]") : [];
    }


    public async containsObject(key: string): Promise<boolean> {
        const command = new HeadObjectCommand({Bucket: this.bucketName, Key: key});
        try {
            await this.s3.send(command);
            return true;
        } catch (error) {
            if (error.name === "NotFound") return false;
            throw error;
        }
    }
}
