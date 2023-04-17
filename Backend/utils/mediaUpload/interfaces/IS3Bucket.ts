import {IS3Object} from "./IS3Object";
import {S3ObjectBuilder} from "../classes";

export interface IS3Bucket {

    /**
     * @param s3ObjectBuilder the object to be created
     * @returns a promise that resolves when the object is created
     */
    createObject(s3ObjectBuilder: S3ObjectBuilder): Promise<IS3Object>;

    /**
     * @param file the file to be created
     * @returns a promise that resolves to the created object
     */
    createObjectFromFile(file: File): Promise<IS3Object>;

    /**
     * @param key the key of the object
     * @returns a promise that resolves to the object with the given key
     */
    getObject(key: string): Promise<IS3Object>;

    /**
     * @param keys the key of the object
     * @returns a promise that resolves to the objects with the given key
     */
    getObjects(keys: string[]): Promise<IS3Object[]>;

    /**
     * @param key the key of the object
     * @returns a promise that resolves when the object with the given key is deleted
     */
    deleteObject(key: string): Promise<void>;

    /**
     * @param keys the key of the objects
     * @returns a promise that resolves when the objects with the given keys are deleted
     */
    deleteObjects(keys: string[]): Promise<void>;

    /**
     * @returns a promise that resolves to a list of all objects in the bucket
     */
    listContent(): Promise<Array<string>>;

    /**
     * @param key the key of the object
     * @returns a promise that resolves to true if the object with the given key exists, false otherwise
     */
    contains(key: string): Promise<boolean>;

    /**
     * renames an object
     * @param oldKey the key of the object
     * @param newKey the new key
     */
    renameObject(oldKey: string, newKey: string): Promise<void>;

    /**
     * gets all the objects
     * @return an array of all objects
     */
    getAllObjects(): Promise<IS3Object[]>;
}
