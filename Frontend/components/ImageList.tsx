import React from "react";
import {ApiData} from "../interfaces";


interface Props {
    data: ApiData[];
}

const RemoveImage = (ImageName: string) => {
    const id = ImageName.split('/').pop();
    const url = 'http://localhost:3000/api/media/delete?id=' + id;
    return async (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        try {
            await fetch(url, {
                method: 'DELETE'
            });
            alert("Image removed: " + ImageName)
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}


export const ImageList: React.FC<Props> = ({data}) => {
    const acceptedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    const filteredData = data.filter((item: string) => {
        const fileExtension = item.split('.').pop();
        return acceptedExtensions.includes(fileExtension);
    });
    return (
        <p>
            <h2>Images</h2>
            <table>
                <tr>
                    {
                        filteredData.map((item: string) => {
                            return <td>
                                <img src={item} alt={item} key={item}/>
                                <button onClick={RemoveImage(item)}>Remove</button>
                            </td>;
                        })
                    }
                </tr>
            </table>
        </p>
    );
};
