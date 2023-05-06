import {NextApiRequest, NextApiResponse} from 'next'
import {currentBucket} from "../../../currentBucket";
import {getS3} from "../../../utils/getS3";


const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    console.log('Request received')
    try {
        const s3 = getS3();
        const buckets = await s3.listBuckets();
        const imagesBucket = await s3.getOrCreateBucket(currentBucket);
        const images = await imagesBucket.getAllObjects();
        const objects = await Promise.all(images.map(image => image.toJSON()))
        if (!Array.isArray(objects)) {
            res.status(500).json({statusCode: 500, message: "Cannot find image data"});
        }

        res.status(200).json(objects)
    } catch (err: any) {
        res.status(500).json({statusCode: 500, message: err.message})
    }
}

export default handler
