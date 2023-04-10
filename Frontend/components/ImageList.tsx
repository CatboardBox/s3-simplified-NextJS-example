import React from "react";
import {ApiData} from "../interfaces";


interface Props {
    data: ApiData[];
}

const RemoveImage = (ImageName: string) => () => {
   alert("Remove Image: " + ImageName);
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
