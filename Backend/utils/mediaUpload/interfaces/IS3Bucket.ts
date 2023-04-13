import {S3Object} from "../classes/s3Object";
import {IS3Object} from "./IS3Object";

export interface IS3Bucket {

    createObject(s3Object: S3Object): Promise<void>

    createObjectFromFile(file: File): Promise<IS3Object>

    getObject(key: string): Promise<IS3Object>

    deleteObject(key: string): Promise<void>

    listObjects(): Promise<Array<string>>

    listObjectsUrls(): Promise<Array<string>>

    changeAccessPolicy(): Promise<void>

    containsObject(key: string): Promise<boolean>

    getPublicUrl(key: string): Promise<string>
}
