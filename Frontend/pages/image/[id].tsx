import React from "react";
import Layout from "../../components/Layout";

interface IS3ObjectJSON {
    FileLink: string | undefined,
    Metadata: [string, string][]
}

interface Props {
    data: IS3ObjectJSON;
    error?: string;
}


const Page: React.FC<Props> = ({data, error}) => {
    return (
        <Layout title={error ? "Error fetching data" : "Image"}>
            {error}
            <br/>
            {
                data && (
                    <div>
                        {data.FileLink && <img src={data.FileLink} alt=""/>}
                        {
                            data.Metadata.map(([key, value]) => (
                                <div key={key}>
                                    <b>{key}</b> : {value}
                                </div>
                            ))
                        }
                        <br/>
                        Download Link: <a href={data.FileLink}>{data.FileLink}</a>
                    </div>
                )
            }
        </Layout>
    );
}


// @ts-ignore
Page.getInitialProps = async ({query}) => {
    const {id} = query
    const props = {}
    try {
        const response = await fetch('http://localhost:3000/api/media/get?id=' + id, {
            method: 'GET',
        });
        const json = await response.json();
        const data: any = json;
        console.log('data', data)
        if (response.ok)
            return {
                ...props,
                data,
            };
        else
            return {
                ...props,
                data: undefined,
                error: 'Error fetching data from server :' + json.message || 'Unknown error',

            };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            ...props,
            data: undefined,
            error: 'Error fetching data from server :' + error.message || 'Unknown error',

        };
    }
}
export default Page;
