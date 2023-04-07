import {NextApiRequest, NextApiResponse} from 'next'
import {S3Lib} from 'utils/mediaUpload/classes/s3lib'
import {S3Object} from "../../../../utils/mediaUpload/classes/s3Object";
import {Metadata} from "../../../../utils/mediaUpload/classes/metadata";
import * as process from "process";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const lib = new S3Lib("ap-southeast-1", process.env.AccessKey, process.env.SecretAccessKey);
    try {
        //generate uuid
        const uuid: string = generateUUID();
        const metadata = new Metadata({
            "Content-Type": req.headers["content-type"],
        });
        const filestream = req.body;
        const numbers = filestream.trim().split(/\s*,\s*/g).map(x => x/1);
        const binstr = String.fromCharCode(...numbers);
        const b64str = btoa(binstr);
        const s3Object = new S3Object(b64str, metadata)
        console.log("====================================");
        console.log(s3Object);
        console.log("====================================");
        //get file type
        const fileType = req.headers["content-type"]; //image/jpeg or image/png
        //remove the first part of the string
        const fileExtension = "." + fileType.split("/")[1];
        //create a new file name
        const fileName = uuid + fileExtension;
        const imagesBucket = await lib.getOrCreateBucket("imagebuckettesting");
        await imagesBucket.createObject(fileName, s3Object);
        res.status(200).json({statusCode: 200, message: "success"})
    } catch (err: any) {
        res.status(500).json({statusCode: 500, message: err.message})
    }
}
const generateUUID = () => {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

export default handler
