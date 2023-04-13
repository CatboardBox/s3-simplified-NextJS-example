import {Readable} from "stream";
import {Metadata} from "./Metadata";
import {generateUUID} from "../utils/GenerateUUID";
import fs from "fs";
import {File} from 'formidable';
import {IMetadata, IS3Object, IS3ObjectJSON} from "../interfaces";

type AcceptedDataTypes = Readable | ReadableStream | Blob | string | Uint8Array | Buffer

export class S3Object implements IS3Object {
    constructor(private data: AcceptedDataTypes, private metadata: Metadata = new Metadata(), private link?: string) {
        if (this.Name === undefined) this.Name = generateUUID();
    }

    public get Body(): AcceptedDataTypes {
        return this.data;
    }

    public get Metadata(): IMetadata {
        return this.metadata;
    }

    public get Link(): string | undefined {
        return this.link;
    }

    /**
     * @internal for internal use only
     * @param value
     */
    public set Link(value: string | undefined) {
        this.link = value;
    }

    public toJSON(): IS3ObjectJSON {
        // console.log("toJSON");
        // console.log(JSON.stringify({
        //     FileLink: this.link,
        //     Metadata: this.Metadata.toRecord(),
        // }));
        return {
            FileLink: this.link,
            Metadata: this.Metadata.Pairs,
        };
    }

    public get DataSize(): number | undefined {
        const sizeStr = this.metadata.get("Content-Length");
        if (sizeStr === undefined) return undefined;
        return parseInt(sizeStr);
    }

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

    public get Name(): string {
        return this.metadata.get("Content-Disposition");
    }

    public set Name(value: string) {
        if (value) this.metadata.set("Content-Disposition", value);
    }

    public get FileName(): string {
        return this.Name + "." + this.Extension;
    }

    public static async fromFile(file: File): Promise<S3Object> {
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
}
