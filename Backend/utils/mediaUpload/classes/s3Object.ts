import {Readable} from "stream";
import {Metadata} from "./metadata";

export class S3Object {
    constructor(public data: Readable, public metadata: Metadata) {
    }

    /**
     * @returns the size of the data in bytes
     */
    public getDataSize(): number {
        return this.data.readableLength;
    }

    /**
     * @returns the data file type (e.g. "image/jpeg")
     */
    public get Type(): string | undefined {
        return this.metadata.getMetadata("Content-Type");
    }

    public set Type(value: string | undefined) {
        if (value) this.metadata.setMetadata("Content-Type", value);
    }

    /**
     * @returns the data file name (e.g. "image.jpg")
     */
    public get Name(): string | undefined {
        return this.metadata.getMetadata("Content-Disposition");
    }

    public set Name(value: string | undefined) {
        if (value) this.metadata.setMetadata("Content-Disposition", value);
    }


}
