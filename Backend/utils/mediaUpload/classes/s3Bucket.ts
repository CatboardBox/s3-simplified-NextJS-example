import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3
} from "@aws-sdk/client-s3";
import {Readable} from "stream";
import {S3Object} from "./s3Object";
import {Metadata} from "./metadata";
import {IS3Object} from "../interfaces/IS3Object";
import {IS3Bucket} from "../interfaces/IS3Bucket";

export class S3Bucket implements IS3Bucket{
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

    async createObject(s3Object: S3Object): Promise<void> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: s3Object.FileName,
            Body: s3Object.Body,
            Metadata: s3Object.Metadata.toRecord()
        });
        await this.s3.send(command);
    }

    async createObjectFromFile(file: File): Promise<IS3Object> {
        const s3Object = await S3Object.fromFile(file);
        await this.createObject(s3Object);
        return s3Object;
    }

    async getObject(key: string): Promise<IS3Object> {
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
        return objects.map(object => this.getPublicUrlInternal(object));
    }

    //todo
    async changeAccessPolicy(): Promise<void> {
        throw new Error("Not implemented");
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

        return this.getPublicUrlInternal(key);
    }
}
