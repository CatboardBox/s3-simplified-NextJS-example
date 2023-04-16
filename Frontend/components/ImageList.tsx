import React from "react";
import {ApiData} from "../interfaces";
import reloadPage from "../util/ReloadPage";
import {acceptedExtensions} from "./AcceptedExtensions";


interface Props {
    data: ApiData[];
}

const RemoveImage = (ImageId: string) => {
    const url = 'http://localhost:3000/api/media/delete?id=' + ImageId.split('?')[0];
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

const ImageLink = (ImageId: string) => () => window.location.pathname = '/image/' + ImageId.split('?')[0];

export const ImageList: React.FC<Props> = ({data}) => {
    const filteredData = data.filter((item: string) => {
        const fileExtension = item.split('.').pop().split('?')[0];
        return acceptedExtensions.includes(fileExtension);
    });
    return (
        <>
            <h2>Images</h2>
            {
                filteredData.map((item: string) => {
                    const id = item.split('/').pop();
                    return <>
                        <img src={item} alt={item} key={item} onClick={ImageLink(id)}/>
                        <button onClick={RemoveImage(id)}>Remove</button>
                    </>;
                })
            }
        </>
    );
};
