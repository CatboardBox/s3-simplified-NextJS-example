import {NextApiRequest, NextApiResponse} from 'next';
import formidable, {File} from 'formidable';
import {S3Object} from "../../../../utils/mediaUpload/classes/s3Object";
import {Metadata} from "../../../../utils/mediaUpload/classes/metadata";
import fs from 'fs';
import {S3Lib} from "../../../../utils/mediaUpload/classes/s3lib";

// const log = (name, data) => {
//     fs.writeFile(name, data, (err: any) => {
//         if (err) {
//             console.error(err)
//             return
//         }
//         //file written successfully
//     })
// }

const writeFile = async (s3Object: S3Object) => {
    const data = s3Object.data;
    // log('test.txt', data)
    // log('test.jpg', data)
    const lib = new S3Lib("ap-southeast-1", process.env.AccessKey, process.env.SecretAccessKey);
    const imagesBucket = await lib.getOrCreateBucket("imagebuckettesting");
    await imagesBucket.createObject(s3Object);
}
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        try {
            const data = await parseFormData(req);
            const uploadedFile: File = data.files.file

            const metadata = new Metadata({
                "Content-Type": uploadedFile.mimetype,
                "Content-Length": uploadedFile.size,
                "Original-Name": uploadedFile.originalFilename,
                "Content-Disposition": uploadedFile.newFilename,
            });
            const fileLocation = uploadedFile.filepath;
            const buffer: Buffer = fs.readFileSync(fileLocation)

            const s3Object = new S3Object(buffer, metadata)

            // console.log("====================================");
            // console.log(s3Object);
            // console.log("====================================");

            await writeFile(s3Object);


            res.status(200).json({message: 'File uploaded successfully', data});
        } catch (error) {
            console.error('Error processing file upload:', error);
            res.status(500).json({message: 'Error processing file upload'});
        }
    } else {
        res.status(405).json({message: 'Method not allowed'});
    }
};

const parseFormData = (req: NextApiRequest): Promise<formidable.Fields & formidable.Files> => {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({fields, files});
        });
    });
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;
