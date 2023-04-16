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
import {Readable} from "stream";
import {S3Object} from "./s3Object";
import {Metadata} from "./Metadata";
import {IS3Bucket, IS3Object} from "../interfaces";
import config from "../config";
import {MissingObject} from "./Errors";
import {S3Lib} from "./s3lib";
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

export class S3Bucket implements IS3Bucket {
    private readonly s3: S3;
    private readonly bucketName: string;
    public readonly bucketUrl: string;
    public isPublic?: boolean;

    /**
     * @internal
     * @param lib
     * @param bucketName
     */
    constructor(lib: S3Lib, bucketName: string) {
        this.s3 = lib.s3;
        this.bucketUrl = `https://${bucketName}.s3.${lib.region}.amazonaws.com`;
        this.bucketName = bucketName;
    }

    private async getPublicUrlInternal(key: string): Promise<string> {
        if (await this.isBucketPublic()) return `${this.bucketUrl}/${key}`;
        return await getSignedUrl(this.s3, new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        }), {expiresIn: config.signedUrlExpiration});
    }

    public async createObject(s3Object: S3Object): Promise<void> {
        console.log(s3Object.FileName);
        const size = s3Object.DataSize;
        if (size === undefined) throw new Error("Data size is undefined");

        if (size <= config.multipartUploadThreshold) {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: s3Object.FileName,
                Body: s3Object.Body,
                Metadata: s3Object.Metadata.toRecord()
            });
            await this.s3.send(command);
            return Promise.resolve();
        }

        // Multipart upload
        console.log("Using multipart upload")

        console.log(s3Object.FileName);
        const createMultipartUploadCommand = new CreateMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: s3Object.FileName,
            Metadata: s3Object.Metadata.toRecord()
        });
        const createMultipartUploadResponse = await this.s3.send(createMultipartUploadCommand);
        const uploadId = createMultipartUploadResponse.UploadId;
        if (!uploadId) throw new Error("Failed to initialize multipart upload");

        const partSize = config.multipartChunkSize;
        const partsCount = Math.ceil(size / partSize);

        console.log(`Uploading ${partsCount} parts...`)

        console.log(s3Object.FileName);
        //Consolidate all the promises into one array and await them all at once rather than one by one
        const promises = new Array<Promise<UploadPartCommandOutput>>(partsCount);
        for (let i = 0; i < partsCount; i++) {
            console.log(`Uploading part ${i + 1} of ${partsCount}`)
            const start = i * partSize;
            const end = Math.min(start + partSize, size);
            const partBuffer = (await s3Object.AsBuffer()).slice(start, end);

            const uploadPartCommand = new UploadPartCommand({
                Bucket: this.bucketName,
                Key: s3Object.FileName,
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

        console.log(s3Object.FileName);
        const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: s3Object.FileName,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: completedParts
            }
        });
        await this.s3.send(completeMultipartUploadCommand);
        console.log("Multipart upload complete");
        console.log(s3Object.FileName);
        console.log("Renaming file to original name...")
        // End multipart upload
        // Rename file to original name as it was renamed to a random name by the multipart upload
        return Promise.resolve();
    }

    public async createObjectFromFile(file: File): Promise<IS3Object> {
        const s3Object = await S3Object.fromFile(file);
        const link = await this.getPublicUrlInternal(s3Object.FileName);
        await this.createObject(s3Object);
        s3Object.Link = link;
        return s3Object;
    }

    public async isBucketPublic(): Promise<boolean> {
        if (this.isPublic !== undefined) return this.isPublic;
        // Check ACL
        const aclCommand = new GetBucketAclCommand({
            Bucket: this.bucketName
        });

        const aclResponse = await this.s3.send(aclCommand);

        for (const grant of aclResponse.Grants || []) {
            if (grant.Grantee.URI === "http://acs.amazonaws.com/groups/global/AllUsers" || grant.Grantee.URI === "http://acs.amazonaws.com/groups/global/AuthenticatedUsers") {
                if (grant.Permission === "READ" || grant.Permission === "FULL_CONTROL") {
                    this.isPublic = true;
                    return true;
                }
            }
        }

        // Check Bucket Policy
        try {
            const policyCommand = new GetBucketPolicyCommand({
                Bucket: this.bucketName
            });

            const policyResponse = await this.s3.send(policyCommand);
            const policy = JSON.parse(policyResponse.Policy);

            for (const statement of policy.Statement) {
                if (statement.Effect === "Allow" && statement.Principal === "*") {
                    if (Array.isArray(statement.Action)) {
                        for (const action of statement.Action) {
                            if (action === "s3:GetObject" || action === "s3:*") {
                                this.isPublic = true;
                                return true;
                            }
                        }
                    } else if (typeof statement.Action === "string" && (statement.Action === "s3:GetObject" || statement.Action === "s3:*")) {
                        this.isPublic = true;
                        return true;
                    }
                }
            }
        } catch (error) {
            if (error.name !== "NoSuchBucketPolicy") {
                throw error;
            }
        }
        this.isPublic = false;
        return false;
    }

    public async getObject(key: string): Promise<IS3Object> {
        const command = new GetObjectCommand({Bucket: this.bucketName, Key: key});
        const response = await this.s3.send(command);
        console.log(response.Metadata);
        const link = await this.getPublicUrlInternal(key);
        return new S3Object(response.Body as Readable, new Metadata(response.Metadata), link);
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

        const deleteCommand = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: oldKey
        });

        await this.s3.send(deleteCommand);
    }

    public async listObjects(): Promise<Array<string>> {
        const command = new ListObjectsV2Command({Bucket: this.bucketName});
        const response = await this.s3.send(command);
        // if response.Contents is not null, then map the array to get the keys
        // else return an empty array
        return response.Contents ? response.Contents.map(content => content.Key || "[unknown]") : [];
    }

    public async listObjectsUrls(): Promise<Array<string>> {
        const objects = await this.listObjects();
        const promises = objects.map(object => this.getPublicUrlInternal(object));
        return Promise.all(promises);
    }

    public async containsObject(key: string): Promise<boolean> {
        try {
            const command = new HeadObjectCommand({Bucket: this.bucketName, Key: key});
            await this.s3.send(command);
            return true;
        } catch (error) {
            if (error.name === "NotFound") return false;
            throw error;
        }
    }

    public async getPublicUrl(key: string): Promise<string> {
        if (!await this.containsObject(key))
            throw new MissingObject(key, this.bucketName);
        return this.getPublicUrlInternal(key);
    }
}
