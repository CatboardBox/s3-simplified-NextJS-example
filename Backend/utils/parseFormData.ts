import {NextApiRequest} from 'next';
import formidable from 'formidable';

export const parseFormData = (req: NextApiRequest): Promise<formidable.Fields & formidable.Files> => {
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
