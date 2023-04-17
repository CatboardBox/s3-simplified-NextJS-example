import {Readable} from "stream";

export function blobToBuffer(blob: Blob): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const buffer = Buffer.from(reader.result as ArrayBuffer);
            resolve(buffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

export function readableToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

export function readableStreamToBuffer(stream: ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        return new Promise(async (resolve, reject) => {
            try {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) {
                        resolve(Buffer.concat(chunks));
                        break;
                    }
                    if (value) {
                        chunks.push(value);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}
