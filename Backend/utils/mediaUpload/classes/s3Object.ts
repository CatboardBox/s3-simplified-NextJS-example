import {Readable} from "stream";
import {Metadata} from "./metadata";
import {generateUUID} from "../utils/GenerateUUID";
import fs from "fs";
import {File} from 'formidable';
import {IS3Object} from "../interfaces/IS3Object";
import {IMetadata} from "../interfaces/IMetadata";

type AcceptedFileTypes = Readable | ReadableStream | Blob | string | Uint8Array | Buffer

export class S3Object implements IS3Object {
    constructor(private data: AcceptedFileTypes, private metadata: Metadata = new Metadata()) {
        if (this.Name === undefined) this.Name = generateUUID();
    }

    /**
     * @returns the size of the data in bytes
     */
    public get DataSize(): number | undefined {
        const sizeStr = this.metadata.get("Content-Length");
        if (sizeStr === undefined) return undefined;
        return parseInt(sizeStr);
    }

    /**
     * @returns the data file type (e.g. "image/jpeg")
     */
    public get Type(): string | undefined {
        return this.metadata.get("Content-Type");
    }

    public set Type(value: string | undefined) {
        if (value) this.metadata.set("Content-Type", value);
    }

    public get Extension(): string | undefined {
        const ext = this.metadata.get("File-Type");
        if (ext) return ext;
        const type = this.Type;
        if (type === undefined || !type.includes("/")) return undefined;
        const split = type.split("/");
        if (split.length !== 2) return undefined
        this.metadata.set("File-Type", split[1]);
        return split[1];
    }

    /**
     * @returns the data file name (e.g. "image")
     */
    public get Name(): string {
        return this.metadata.get("Content-Disposition");
    }

    public set Name(value: string) {
        if (value) this.metadata.set("Content-Disposition", value);
    }

    public get FileName(): string {
        return this.Name + "." + this.Extension;
    }

    public get Body(): AcceptedFileTypes {
        return this.data;
    }

    static async fromFile(file: File): Promise<S3Object> {
        return new Promise<S3Object>((resolve, _) => {
            const metadata = new Metadata({
                "Content-Type": file.mimetype,
                "Content-Length": file.size,
                "Original-Name": file.originalFilename,
                "Content-Disposition": file.newFilename,
            });
            const fileLocation = file.filepath;
            const buffer: Buffer = fs.readFileSync(fileLocation)
            const s3Object = new S3Object(buffer, metadata)
            return resolve(s3Object);
        });
    }

    get Metadata(): IMetadata {
        return this.metadata;
    }
}
