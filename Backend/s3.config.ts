import {configTemplate} from "./utils/s3-simplified";
import process from "process";


export const config: Partial<configTemplate> = {
    accessKey: {
        id: process.env.accessKey,
        secret: process.env.secretAccessKey,
    },

    region: "ap-southeast-1",
}
