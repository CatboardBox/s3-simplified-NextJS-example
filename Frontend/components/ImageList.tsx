import React from "react";
import {ApiData} from "../interfaces";
import reloadPage from "../util/ReloadPage";
import {acceptedExtensions} from "./AcceptedExtensions";


interface Props {
    data: ApiData[];
}

const RemoveImage = (ImageId: string) => {
    const url = 'http://localhost:3000/api/media/delete?id=' + ImageId;
    return async (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        try {
            await fetch(url, {
                method: 'DELETE'
            });
            reloadPage();
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}

const ImageLink = (ImageId: string) => () => window.location.pathname = '/image/' + ImageId;

export const ImageList: React.FC<Props> = ({data}) => {
    const filteredData = data.filter((item: ApiData) => {
        const fileExtension = item.Metadata.find(([key, value]) => key === 'file-type')?.[1];
        return acceptedExtensions.includes(fileExtension);
    });
    return (
        <>
            <h2>Images</h2>
            {
                filteredData.map((item: ApiData) => {
                    const id = item.Metadata.find(([key, value]) => key === 'identifier')?.[1];
                    const originalFile = item.Metadata.find(([key, value]) => key === 'original-name')?.[1];
                    const url = item.FileLink;
                    return <>
                        <img src={url} alt={originalFile} key={id} onClick={ImageLink(id)}/>
                        <button onClick={RemoveImage(id)}>Remove</button>
                    </>;
                })
            }
        </>
    );
};
