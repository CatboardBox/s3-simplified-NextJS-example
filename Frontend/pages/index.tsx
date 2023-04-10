import Layout from '../components/Layout';
import React from 'react';
import {GetServerSideProps} from 'next';
import {ImageList} from "../components/ImageList";
import {UploadImage} from "../components/UploadImage";
import {ApiData} from "../interfaces";

interface IndexPageProps {
    data: ApiData[];
}


const IndexPage: React.FC<IndexPageProps> = ({data}) => {
    return (
        <Layout title="Home | Next.js + TypeScript Example">
            <h1>Images</h1>
            <ImageList data={data}/>
            <UploadImage/>
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps<IndexPageProps> = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/media');
        const data: ApiData[] = await response.json();
        return {
            props: {
                data,
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            props: {
                data: [],
            },
        };
    }
};

export default IndexPage;
