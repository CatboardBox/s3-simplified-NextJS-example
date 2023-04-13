import Layout from '../components/Layout';
import React from 'react';
import {GetServerSideProps} from 'next';
import {ImageList} from "../components/ImageList";
import {UploadImage} from "../components/UploadImage";
import {ApiData} from "../interfaces";

interface IndexPageProps {
    data: ApiData[];
    error?: string;
}


const IndexPage: React.FC<IndexPageProps> = ({data, error}) => {
    return (
        <Layout title="S3 Example">
            {error === undefined && <>
                <h1>Images</h1>
                <ImageList data={data}/>
                <UploadImage/>
            </>}
            {error && <>
                <h1>oops, we have encountered an error</h1>
                {error && <p>{error}</p>}
            </>}
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/media');
        const json = await response.json();
        const data: ApiData[] = json;
        if (response.ok)
            return {
                props: {
                    data,
                },
            };
        else
            return {
                props: {
                    data: [],
                    error: 'Error fetching data from server :' + json.message || 'Unknown error',
                },
            };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                data: [],
                error: 'Error fetching data from server :' + error.message || 'Unknown error',
            },
        };
    }
};

export default IndexPage;
