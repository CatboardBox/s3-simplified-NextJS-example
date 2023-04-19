import {IS3Object, S3BucketService} from "../../interfaces";
import {S3Lib} from "../misc/s3lib";
import {ExistingObject, MissingObject} from "../misc/errors";
import {S3BucketInternal} from "./s3BucketInternal";
import {S3ObjectBuilder} from "../objects/s3ObjectBuilder";
import {getConfig} from "../../utils/config";

export class S3Bucket implements S3BucketService {
    private internal: S3BucketInternal;

    /**
     * @internal
     * @param lib
     * @param bucketName
     */
    constructor(lib: S3Lib, bucketName: string) {
        this.internal = new S3BucketInternal(lib, bucketName);
    }

    public async createObject(s3Object: S3ObjectBuilder): Promise<IS3Object> {
        await this.assertNoConflicts(s3Object.Id);
        const size = s3Object.DataSize;
        if (size === undefined) throw new Error("Data size is undefined");
        return size <= getConfig().multiPartUpload.enabledThreshold ? this.internal.createObject_Single(s3Object) : this.internal.createObject_Multipart(s3Object);
    }

    public async getObject(key: string): Promise<IS3Object> {
        await this.assertExists(key);
        return this.internal.getObject(key);
    }

    public async getObjects(keys: string[]): Promise<IS3Object[]> {
        return Promise.all(keys.map(key => this.getObject(key)));
    }

    public async deleteObject(key: string): Promise<void> {
        await this.assertExists(key);
        return this.internal.deleteObject(key);
    }

    public async deleteObjects(keys: string[]): Promise<void> {
        await Promise.all(keys.map(key => this.deleteObject(key)));
    }

    public async renameObject(oldKey: string, newKey: string): Promise<void> {
        await Promise.all([this.assertNoConflicts(newKey), this.assertExists(oldKey),]);
        return this.internal.renameObject(oldKey, newKey);
    }

    public async getAllObjects(): Promise<IS3Object[]> {
        const objectKeys = await this.internal.listContents();
        const promises = objectKeys.map(key => this.internal.getObject(key));
        return Promise.all(promises);
    }

    public async contains(key: string): Promise<boolean> {
        return this.internal.containsObject(key);
    }

    public async listContent(): Promise<Array<string>> {
        return this.internal.listContents();
    }

    protected async assertExists(key: string): Promise<void> {
        if (!await this.internal.containsObject(key)) throw new MissingObject(key, this.internal.bucketName);
    }

    protected async assertNoConflicts(key: string): Promise<void> {
        if (await this.internal.containsObject(key)) throw new ExistingObject(key, this.internal.bucketName);
    }
}
