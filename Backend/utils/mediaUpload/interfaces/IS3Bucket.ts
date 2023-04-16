import {S3Object} from "../classes";
import {IS3Object} from "./IS3Object";

export interface IS3Bucket {

    /**
     * @param s3Object the object to be created
     * @returns a promise that resolves when the object is created
     */
    createObject(s3Object: S3Object): Promise<void>

    /**
     * @param file the file to be created
     * @returns a promise that resolves to the created object
     */
    createObjectFromFile(file: File): Promise<IS3Object>

    /**
     * @param key the key of the object
     * @returns a promise that resolves to the object with the given key
     */
    getObject(key: string): Promise<IS3Object>

    /**
     * @param key the key of the object
     * @returns a promise that resolves when the object with the given key is deleted
     */
    deleteObject(key: string): Promise<void>

    /**
     * @returns a promise that resolves to a list of all objects in the bucket
     */
    listObjects(): Promise<Array<string>>

    /**
     * @returns a promise that resolves to a list of all objects in the bucket
     */
    listObjectsUrls(): Promise<Array<string>>

    // /**
    //  * @returns a promise that resolves when the bucket policy has been changed
    //  */
    // changeAccessPolicy(): Promise<void>

    /**
     * @param key the key of the object
     * @returns a promise that resolves to true if the object with the given key exists, false otherwise
     */
    containsObject(key: string): Promise<boolean>

    /**
     * @param key the key of the object
     * @returns a promise that resolves to the public url of the object with the given key
     */
    getPublicUrl(key: string): Promise<string>
}
