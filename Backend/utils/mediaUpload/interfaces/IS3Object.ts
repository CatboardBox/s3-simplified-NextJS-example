import {IMetadata} from "./IMetadata";
import {Readable} from "stream";

export interface IS3Object {

    get Body(): Readable | undefined

    /**
     * @returns a metadata object
     * @constructor
     */
    get Metadata(): IMetadata

    /**
     * @returns the size of the data in bytes
     */
    get DataSize(): number | undefined

    /**
     * @returns the data file type (e.g. "image/jpeg")
     */
    get Type(): string | undefined

    /**
     * @returns the data file extension (e.g. "jpeg")
     * @constructor
     */
    get Extension(): string | undefined

    /**
     * @returns the data file name (e.g. "image")
     */
    get Name(): string

    /**
     * @returns the data file name with extension (e.g. "image.jpeg")
     * @constructor
     */
    get FileName(): string

    generateLink(): Promise<string>;

    toJSON(): Promise<IS3ObjectJSON>;
}

export interface IS3ObjectJSON {
    FileLink: string | undefined,
    Metadata: [string, string][],
}
