import {S3Lib} from "s3-simplified";
import {createHash} from 'crypto';

export function getS3() {
    return new S3Lib({
        accessKey: {
            id: process.env.accessKey,
            secret: process.env.secretAccessKey,
        },
        region: "ap-southeast-1",
        objectCreation: {
            hash: {
                function: Hash,
            }
        },
    });
}

async function Hash(buffer: Buffer, metadata: Record<string, string>): Promise<string> {
    console.log("using hash function");
    const metaDataStr = JSON.stringify(metadata, Object.keys(metadata).sort());
    const hash = createHash('sha256').update(buffer).update(metaDataStr).digest('hex');
    console.log(hash);
    return hash;
}
