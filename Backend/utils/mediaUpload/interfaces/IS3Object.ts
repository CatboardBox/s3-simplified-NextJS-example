import {IMetadata} from "./IMetadata";

export interface IS3Object {

    get Metadata(): IMetadata

    /**
     * @returns the size of the data in bytes
     */
    get DataSize(): number | undefined

    /**
     * @returns the data file type (e.g. "image/jpeg")
     */
    get Type(): string | undefined

    get Extension(): string | undefined

    /**
     * @returns the data file name (e.g. "image")
     */
    get Name(): string

    get FileName(): string
}
