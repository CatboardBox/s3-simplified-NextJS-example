import {NextApiRequest, NextApiResponse} from 'next';
import {File} from 'formidable';
import {Metadata, S3Lib, S3ObjectBuilder} from 's3-simplified';
import {parseFormData} from "../../../../utils/parseFormData";
import {currentBucket} from "../../../../currentBucket";
import {getS3} from "../../../../utils/getS3";
import fs from "fs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            const data = await parseFormData(req);
            const file: File = data.files.file

            const s3 = getS3();
            const imagesBucket = await getS3().getOrCreateBucket(currentBucket);
            const metadata = new Metadata({
                "content-type": file.mimetype,
                "content-length": file.size,
                "original-name": file.originalFilename,
                // "content-disposition": file.newFilename,
            });
            const fileLocation = file.filepath;
            const buffer: Buffer = fs.readFileSync(fileLocation)
            const s3Object = new S3ObjectBuilder(buffer, metadata)
            await imagesBucket.createObject(s3Object);

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
