import {NextApiRequest, NextApiResponse} from 'next'
import {S3Lib} from 'utils/mediaUpload/classes/s3lib'
import process from "process";


const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    const lib = new S3Lib("ap-southeast-1", process.env.AccessKey, process.env.SecretAccessKey);
    try {
        const imagesBucket = await lib.getOrCreateBucket("imagebuckettesting");
        const images = await imagesBucket.listObjectsUrls();
        if (!Array.isArray(images)) {
            res.status(500).json({statusCode: 500, message: "Cannot find image data"});
        }

        res.status(200).json(images)
    } catch (err: any) {
        res.status(500).json({statusCode: 500, message: err.message})
    }
}

export default handler
