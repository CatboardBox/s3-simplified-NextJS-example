import {Readable} from "stream";
import {Metadata} from "./Metadata";
import {generateUUID} from "../utils/GenerateUUID";
import fs from "fs";
import {File} from 'formidable';
import {IMetadata} from "../interfaces";
import {FileTypeParser} from "../utils/FileTypeParser";

type AcceptedDataTypes = Readable | ReadableStream | Blob | string | Uint8Array | Buffer

export class S3ObjectBuilder{
    constructor(private data: AcceptedDataTypes, private metadata: Metadata = new Metadata()) {
        if (this.Name === undefined) this.Name = generateUUID();
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

    public set Type(value: string | undefined) {
        if (value) this.metadata.set("Content-Type", value);
    }

    public get Extension(): string | undefined {
        const ext = this.metadata.get("File-Type");
        if (ext) return ext;
        const type = this.Type;
        if (type === undefined) return undefined;
        const fileType = FileTypeParser(type);
        this.metadata.set("File-Type", fileType);
        return fileType;
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

    public async AsBuffer(): Promise<Buffer> {
        const data = this.data;
        if (Buffer.isBuffer(data)) return data;
        if (data instanceof Uint8Array) return Buffer.from(data.buffer);
        if (typeof data === 'string') return Buffer.from(data);
        if (data instanceof Blob) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const buffer = Buffer.from(reader.result as ArrayBuffer);
                    resolve(buffer);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(data);
            });
        }
        if (data instanceof Readable) {
            return new Promise((resolve, reject) => {
                const chunks: Uint8Array[] = [];
                data.on('data', chunk => chunks.push(chunk));
                data.on('end', () => resolve(Buffer.concat(chunks)));
                data.on('error', reject);
            });
        }
        // ReadableStream case
        const reader = data.getReader();
        const chunks: Uint8Array[] = [];

        return new Promise(async (resolve, reject) => {
            try {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) {
                        resolve(Buffer.concat(chunks));
                        break;
                    }
                    if (value) {
                        chunks.push(value);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });

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
}
