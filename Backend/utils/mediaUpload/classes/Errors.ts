abstract class InvalidError extends Error {
}

export class MissingBucket extends InvalidError {
    constructor(bucketName: string) {
        super();
        this.message = `Bucket ${bucketName} does not exist`;
        this.name = "InvalidBucket";
    }
}

export class InvalidBucketName extends InvalidError {
    constructor(bucketName: string) {
        super();
        this.message = `Bucket name "${bucketName}" is invalid`;
        this.name = "InvalidBucketName";
    }
}

export class MissingObject extends InvalidError {
    constructor(key: string, bucketName: string) {
        super();
        this.message = `Object ${key} does not exist in bucket ${bucketName}`;
        this.name = "InvalidObject";
    }
}
