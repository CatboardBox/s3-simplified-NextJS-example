import {NextApiRequest, NextApiResponse} from 'next'
import {S3Lib} from '../../../utils/mediaUpload'
import {currentBucket} from "../../../utils/currentBucket";



const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    console.log('Request received')
    try {
        const imagesBucket = await S3Lib.Default.getOrCreateBucket(currentBucket);
        const images = await imagesBucket.getAllObjects();
        const urls = await Promise.all(images.map(image => image.generateLink()))
        if (!Array.isArray(urls)) {
            res.status(500).json({statusCode: 500, message: "Cannot find image data"});
        }

        res.status(200).json(urls)
    } catch (err: any) {
        res.status(500).json({statusCode: 500, message: err.message})
    }
}

export default handler
