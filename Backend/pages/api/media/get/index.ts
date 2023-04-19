import {NextApiRequest, NextApiResponse} from "next";
import {S3Lib} from "s3-simplified";
import {currentBucket} from "../../../../currentBucket";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('Request received')
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Preflight request. Reply successfully:
        res.status(200).json({message: 'Preflight request successful'});
        return;
    }
    if (req.method === 'GET') {
        console.log('GET request received')
        const {id} = req.query;
        if (!id) {
            res.status(400).json({message: 'ID is required'});
            return;
        }
        if (typeof id !== 'string') {
            res.status(400).json({message: 'ID must be a string'});
            return;
        }

        try {

            const imagesBucket = await S3Lib.Default.getOrCreateBucket(currentBucket);
            const containsImage = imagesBucket.contains(id);
            if (!containsImage) {
                res.status(400).json({message: 'Image does not exist'});
                return;
            }

            if (await imagesBucket.contains(id) === false) {
                res.status(400).json({message: 'Image does not exist'});
                return;
            }

            const object = await imagesBucket.getObject(id);

            console.log("object.toJSON()");
            res.status(200).json(await object.toJSON());
        } catch (error) {
            console.error('Error getting data:', error);
            res.status(500).json({message: 'Error getting data'});
        }
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};

export default handler;

