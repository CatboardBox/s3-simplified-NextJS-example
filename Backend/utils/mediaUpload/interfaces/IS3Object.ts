import {IMetadata} from "./IMetadata";
import {Readable} from "stream";
import {IS3ObjectJSON} from "./IS3ObjectJSON";

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

    /**
     * @returns a promise that resolves to a link to the object
     */
    generateLink(): Promise<string>;

    /**
     * @returns a promise that resolves to a JSON representation of the object
     */
    toJSON(): Promise<IS3ObjectJSON>;
}
