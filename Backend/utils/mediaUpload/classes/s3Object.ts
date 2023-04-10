import {Readable} from "stream";
import {Metadata} from "./metadata";
import {generateUUID} from "../utils/GenerateUUID";

type dataType = Readable | ReadableStream | Blob | string | Uint8Array | Buffer

export class S3Object {
    constructor(public data: dataType, public metadata: Metadata = new Metadata()) {
        if (this.Name === undefined) this.Name = generateUUID();
    }

    // /**
    //  * @returns the size of the data in bytes
    //  */
    // public getDataSize(): number {
    //     return this.data.readableLength;
    // }

    /**
     * @returns the data file type (e.g. "image/jpeg")
     */
    public get Type(): string | undefined {
        return this.metadata.getMetadata("Content-Type");
    }

    public set Type(value: string | undefined) {
        if (value) this.metadata.setMetadata("Content-Type", value);
    }

    public get Extension(): string | undefined {
        const ext = this.metadata.getMetadata("File-Type");
        if (ext) return ext;
        const type = this.Type;
        if (type === undefined || !type.includes("/")) return undefined;
        const split = type.split("/");
        if (split.length !== 2) return undefined
        this.metadata.setMetadata("File-Type", split[1]);
        return split[1];
    }

    /**
     * @returns the data file name (e.g. "image")
     */
    public get Name(): string {
        return this.metadata.getMetadata("Content-Disposition");
    }

    public set Name(value: string) {
        if (value) this.metadata.setMetadata("Content-Disposition", value);
    }

    public get FileName(): string {
        return this.Name + "." + this.Extension;
    }
}
