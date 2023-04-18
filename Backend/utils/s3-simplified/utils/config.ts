import {configTemplate,defaultConfig} from "./configTemplate";


try{
    // noinspection ES6ConvertVarToLetConst
    var userConfig = require("/s3.config"); //purposely used var here, its intentional
}catch (e) {
    const err = new Error("s3.config.ts is missing, please create one and add it to the root directory");
    err.stack = undefined; // Remove the stack trace to make it look cleaner, the stack trace is not needed for this error anyway
    throw err;
}

let combined: configTemplate;

export const getConfig = (): configTemplate => {
    if (!combined) {
        let temp : configTemplate = {
            ...defaultConfig,
            ...userConfig.config,
        }
        if (!temp.accessKey) {
            throw new Error("Access key is required");
        }
        if (!temp.region) {
            throw new Error("Region is required");
        }
        combined = temp;
    }
    return combined;
}
