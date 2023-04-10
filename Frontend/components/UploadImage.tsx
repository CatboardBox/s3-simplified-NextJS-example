import React, {useState} from 'react';
import reloadPage from "../util/ReloadPage";

const acceptedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
const uploadUrl = 'http://localhost:3000/api/media/upload';

export const UploadImage: React.FC = () => {
    const [picture, setPicture] = useState<File | null>(null);
    const [imgData, setImgData] = useState<string | ArrayBuffer | null>(null);
    const [debug, setDebug] = useState(['empty', 'empty']);

    const onUpload = async (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        const debugData = [];
        debugData[0] = JSON.stringify(picture);
        debugData[1] = JSON.stringify(imgData);
        setDebug(debugData);

        if (picture === null) return;

        // Upload logic
        const formData = new FormData();
        formData.append('file', picture);

        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });
            const responseData = await response.json();
            setDebug([JSON.stringify(responseData, null, 2), debug[1]]);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
        reloadPage();
    };

    const onChangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            console.log('picture: ', e.target.files);
            const fileExtension = e.target.files[0].name.split('.').pop();
            if (!acceptedExtensions.includes(fileExtension as string)) {
                alert('File type not supported');
                return;
            }
            setPicture(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgData(reader.result);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div>
            <h2>Upload Image</h2>
            <h3>Preview</h3>
            <img src={imgData as string} alt="Preview"/>
            <br/>
            <input type="file" onChange={onChangePicture}/>
            <input type="submit" value="Upload" onClick={onUpload}/>

            <h3>Debug</h3>
            <p>{'picture: ' + debug[0]}</p>
            <p>{'imgData: ' + debug[1]}</p>
        </div>
    );
};
