import {Regions} from "./types";
import process from "process";
import {MB, Minute} from "./utils/constants";

type config = {
    multipartChunkSize: number;
    multipartUploadThreshold: number,
    region: Regions,

    accessKeyId: string,
    secretAccessKey: string,

    // noinspection SpellCheckingInspection
    signedUrlExpiration: number,
    /**
     * This would only affect new uploads, not existing ones
     */
    appendFileTypeToKey: boolean,
}

const config: config = {
    multipartChunkSize: 5 * MB,
    multipartUploadThreshold: 5 * MB,
    region: "ap-southeast-1",

    accessKeyId: process.env.accessKey,
    secretAccessKey: process.env.secretAccessKey,

    signedUrlExpiration: 5 * Minute,
    appendFileTypeToKey: true,
}
export default config
