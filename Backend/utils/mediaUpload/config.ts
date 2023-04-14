import {Regions} from "./types";
import process from "process";

type config = {
    multipartChunkSize: number;
    multipartUploadThreshold: number,
    region: Regions,

    accessKeyId: string,
    secretAccessKey: string,
}
const config: config = {
    multipartChunkSize: 1024 * 1024 * 5, // 5 MB
    multipartUploadThreshold: 1024 * 1024 * 5, // 5 MB
    region: "ap-southeast-1",

    accessKeyId: process.env.accessKey,
    secretAccessKey: process.env.secretAccessKey,
}
export default config
