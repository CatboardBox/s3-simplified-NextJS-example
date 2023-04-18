import {Readable} from "stream";
import {Metadata} from "../misc/metadata";
import {generateUUID} from "../../utils/generateUUID";
import fs from "fs";
import {File} from 'formidable';
import {IMetadata} from "../../interfaces";
import {FileTypeParser} from "../../utils/fileTypeParser";
import {blobToBuffer, readableStreamToBuffer, readableToBuffer} from "../../utils/convertToBuffer";
import config from "../../config";

type AcceptedDataTypes = Readable | ReadableStream | Blob | string | Uint8Array | Buffer

export class S3ObjectBuilder {
    constructor(private data: AcceptedDataTypes, private metadata: Metadata = new Metadata()) {
        if (this.UUID === undefined) this.UUID = generateUUID();
    }

    public get Body(): AcceptedDataTypes {
        return this.data;
    }

    public get Metadata(): IMetadata {
        return this.metadata;
    }

    public get DataSize(): number | undefined {
        const sizeStr = this.metadata.get("Content-Length");
        if (sizeStr === undefined) return undefined;
        return parseInt(sizeStr);
    }

    public get Type(): string | undefined {
        return this.metadata.get("Content-Type");
    }

    public get Extension(): string | undefined {
        const ext = this.metadata.get("File-Type");
        if (ext) return ext;
        return this.generateExtension();
    }

    private generateExtension(): string | undefined {
        const type = this.Type;
        if (type === undefined) return undefined;
        const fileType = FileTypeParser(type);
        this.metadata.set("File-Type", fileType);
        return fileType;
    }

    public get UUID(): string {
        return this.metadata.get("Content-Disposition");
    }

    private set UUID(value: string) {
        if (value) this.metadata.set("Content-Disposition", value);
    }

    public get Id(): string {
        const id = this.metadata.get("identifier");
        if (id) return id;
        return this.generateIdentifier();
    }

    private generateIdentifier(): string {
        const uuid = this.UUID;
        const ext = this.Extension; // This will generate the extension if it doesn't exist, so we call it even if we don't need it.
        const newId = (config.appendFileTypeToKey) ? uuid + "." + ext : uuid;
        this.metadata.set("identifier", newId);
        return newId;
    }

    public static async fromFile(file: File): Promise<S3ObjectBuilder> {
        return new Promise<S3ObjectBuilder>((resolve, _) => {
            const metadata = new Metadata({
                "content-type": file.mimetype,
                "content-length": file.size,
                "original-name": file.originalFilename,
                "content-disposition": file.newFilename,
            });
            const fileLocation = file.filepath;
            const buffer: Buffer = fs.readFileSync(fileLocation)
            const s3Object = new S3ObjectBuilder(buffer, metadata)
            return resolve(s3Object);
        });
    }

    // Some of the methods results in the data being "casted" to a Buffer, while others copy the data directly to a buffer.
    public async AsBuffer(): Promise<Buffer> {
        const data = this.data;
        if (Buffer.isBuffer(data)) return data;
        if (data instanceof Uint8Array) return Buffer.from(data.buffer);
        if (typeof data === 'string') return Buffer.from(data);
        if (data instanceof Blob) return blobToBuffer(data);
        if (data instanceof Readable) return readableToBuffer(data);
        if (data instanceof ReadableStream) return readableStreamToBuffer(data);
        throw new Error("Invalid data type");
    }
}
