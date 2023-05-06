import {S3Lib} from "s3-simplified";
import {hashS3} from "./hash";

export function getS3() {
    return new S3Lib({
        accessKey: {
            id: process.env.accessKey,
            secret: process.env.secretAccessKey,
        },
        region: "ap-southeast-1",
        objectCreation: {
            hash: {
                function: hashS3,
            }
        },
    });
}
