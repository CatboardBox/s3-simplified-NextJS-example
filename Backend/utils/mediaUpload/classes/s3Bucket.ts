import {
    CompletedPart,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    DeleteObjectCommand,
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

export class S3Bucket implements IS3Bucket {
    private s3: S3;
    private readonly bucketName: string;
    private readonly getPublicUrlInternal: (key: string) => string;

    /**
     * @internal
     * @param s3
     * @param stringUrl
     * @param bucketName
     */
    constructor(s3: S3, stringUrl: string, bucketName: string) {
        this.s3 = s3;
        this.bucketName = bucketName;
        this.getPublicUrlInternal = (key: string) => {
            return `${stringUrl}/${key}`;
        }
    }

    public async createObject(s3Object: S3Object): Promise<void> {
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

        console.log("Using multipart upload")
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

        const completeMultipartUploadCommand = new CompleteMultipartUploadCommand({
            Bucket: this.bucketName,
            Key: s3Object.FileName,
            UploadId: uploadId,
            MultipartUpload: {
                Parts: completedParts
            }
        });
        await this.s3.send(completeMultipartUploadCommand);
        console.log("Multipart upload complete")
        return Promise.resolve();
    }

    public async createObjectFromFile(file: File): Promise<IS3Object> {
        const s3Object = await S3Object.fromFile(file);
        await this.createObject(s3Object);
        s3Object.Link = this.getPublicUrlInternal(s3Object.FileName);
        return s3Object;
    }

    public async getObject(key: string): Promise<IS3Object> {
        const command = new GetObjectCommand({Bucket: this.bucketName, Key: key});
        const response = await this.s3.send(command);
        console.log(response.Metadata);
        return new S3Object(response.Body as Readable, new Metadata(response.Metadata), this.getPublicUrlInternal(key));
    }

    public async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({Bucket: this.bucketName, Key: key});
        await this.s3.send(command);
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
        return objects.map(object => this.getPublicUrlInternal(object));
    }

    //todo
    public async changeAccessPolicy(): Promise<void> {
        throw new Error("Not implemented");
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
