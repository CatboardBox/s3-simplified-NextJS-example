import {Readable} from "stream";
import {Metadata} from "../misc/metadata";
import {IMetadata, IS3Object, IS3ObjectJSON} from "../../interfaces";
import {S3BucketInternal} from "../buckets/s3BucketInternal";

export class S3Object implements IS3Object {
    constructor(private metadata: IMetadata = new Metadata(), private bucketSource: S3BucketInternal, private body?: Readable) {
    }

    public get Body(): Readable | undefined {
        return this.body;
    }

    public get key(): string {
        return this.Id
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
        return this.metadata.get("File-Type");
    }

    public get UUID(): string {
        return this.metadata.get("Content-Disposition");
    }

    public get Id(): string {
        return this.metadata.get("identifier");
    }

    public async generateLink(): Promise<string> {
        return await this.bucketSource.isPublic() ? this.bucketSource.generatePublicUrl(this.key) : await this.bucketSource.generateSignedUrl(this.key);
    }

    public async toJSON(): Promise<IS3ObjectJSON> {
        return {
            FileLink: await this.generateLink(),
            Metadata: this.Metadata.Pairs,
        };
    }
}
