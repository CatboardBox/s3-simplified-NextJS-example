import {NextApiRequest, NextApiResponse} from "next";
import {S3Lib} from "../../../../utils/mediaUpload/classes/s3lib";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'DELETE') {
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
            const lib = new S3Lib("ap-southeast-1", process.env.AccessKey, process.env.SecretAccessKey);
            const imagesBucket = await lib.getOrCreateBucket("imagebuckettesting");
            const containsImage = imagesBucket.containsObject(id);
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

