import {NextApiRequest, NextApiResponse} from 'next';
import {File} from 'formidable';
import {S3Lib} from "../../../../utils/mediaUpload";
import {parseFormData} from "../../../../utils/parseFormData";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            const data = await parseFormData(req);
            const uploadedFile: File = data.files.file

            const lib = new S3Lib("ap-southeast-1", process.env.AccessKey, process.env.SecretAccessKey);
            const imagesBucket = await lib.getOrCreateBucket("imagebuckettesting");
            await imagesBucket.createObjectFromFile(uploadedFile);

            res.status(200).json({message: 'File uploaded successfully', data});
        } catch (error) {
            console.error('Error processing file upload:', error);
            res.status(500).json({message: 'Error processing file upload'});
        }
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
