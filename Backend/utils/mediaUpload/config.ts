import process from "process";
import {MB, Minute} from "./utils/constants";
import {configTemplate} from "./configTemplate";

const config: configTemplate = {
    accessKey: {
        id: process.env.accessKey,
        secret: process.env.secretAccessKey,
    },

    region: "ap-southeast-1",

    multiPartUpload: {
        maxPartSize: 5 * MB,
        enabledThreshold: 5 * MB,
    },

    signedUrl: {
        expiration: 5 * Minute,
    },

    appendFileTypeToKey: true,
}
export default config
