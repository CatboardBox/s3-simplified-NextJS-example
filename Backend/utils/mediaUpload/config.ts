import {Regions} from "./types";
import process from "process";
import {B, KB, MB} from "./utils/Constants";

type config = {
    multipartChunkSize: number;
    multipartUploadThreshold: number,
    region: Regions,

    accessKeyId: string,
    secretAccessKey: string,
}
const config: config = {
    multipartChunkSize: 5 * MB,
    multipartUploadThreshold: 5 * MB,
    region: "ap-southeast-1",

    accessKeyId: process.env.accessKey,
    secretAccessKey: process.env.secretAccessKey,
}
export default config
