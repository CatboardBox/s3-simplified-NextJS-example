# s3-simplified example

Testing AWS S3 with s3-simplified

## Installation

run `npm install`
create a `.env` file in [Backend/.env](/Backend/.env) with the following variables:

```
AccessKey='Your Access Key'
SecretAccessKey='Your Secret Access Key' 
```

## Setting up AWS

In Aws, create the required buckets and add the following variables to
the [current bucket file](Backend/currentBucket.ts):
By default the file would look something like this:

```
// noinspection JSUnusedLocalSymbols

const publicBucket = "imagebuckettesting";
const nonPublicBucket = "imagebuckettestingbutpublic"

export const currentBucket = nonPublicBucket
```

however those buckets are unique to me, so you would need to create your own buckets and change the variables to match
your buckets.
`note: you just need to export the name of the bucket you want to use, I'm using two buckets for testing purposes`

## Usage

run `npm run dev` to start the server (in development mode)
or run `npm build` followed by `npm start` to start the server (in production mode)

The frontend is hosted on `localhost:8000` and the backend is hosted on `localhost:3000`

## s3-simplified

for more information on this project, check out the [GitHub repository](https://github.com/catcd1w3r5/s3-simplified)
