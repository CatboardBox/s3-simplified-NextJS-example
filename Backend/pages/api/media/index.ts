import {NextApiRequest, NextApiResponse} from 'next'
import {S3Lib} from '../../../utils/mediaUpload'



const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    console.log('Request received')
    try {
        const imagesBucket = await S3Lib.Default.getOrCreateBucket("imagebuckettesting");
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
