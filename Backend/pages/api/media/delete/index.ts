import {NextApiRequest, NextApiResponse} from "next";
import {S3Lib} from "../../../../utils/mediaUpload";
import {currentBucket} from "../../../../utils/currentBucket";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('Request received')
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // Preflight request. Reply successfully:
        res.status(200).json({ message: 'Preflight request successful' });
        return;
    }
    if (req.method === 'DELETE') {
        console.log('Delete request received')
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
            // Delete the data using the ID
            // For example, if you're using a database, remove the record with the specified ID
            console.log(`Deleting data with ID: ${id}`);
            const imagesBucket = await S3Lib.Default.getOrCreateBucket(currentBucket);
            const containsImage = imagesBucket.contains(id);
            if (!containsImage) {
                res.status(400).json({message: 'Image does not exist'});
                return;
            }
            await imagesBucket.deleteObject(id);

            res.status(200).json({message: 'Data deleted successfully', id});
        } catch (error) {
            console.error('Error deleting data:', error);
            res.status(500).json({message: 'Error deleting data'});
        }
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};

export default handler;

