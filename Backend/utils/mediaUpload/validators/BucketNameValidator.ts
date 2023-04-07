import {DynamicValidator, ImmutableValidator} from "../utils/Validator";

class BucketNameValidator {

    public static readonly Singleton: ImmutableValidator<string> = BucketNameValidator.createBucketNameValidator().toImmutable();

    //Naming rules
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
    public static createBucketNameValidator(): DynamicValidator<string> {
        //Define Rules (rules below have more restrictions than the ones listed in the link above e.g. periods are allowed but not recommended for optimal performance so they're simply not allowed here)
        // must be between 3 and 63 characters long
        const between3and63 = (value: string) => value.length >= 3 && value.length <= 63;
        // must start with a letter or number
        const startsWithLetterOrNumber = (value: string) => /^[a-z0-9]/.test(value);
        // must end with a letter or number
        const endsWithLetterOrNumber = (value: string) => /[a-z0-9]$/.test(value);
        // no .
        const noDot = (value: string) => !value.includes('.');
        // no uppercase letters
        const noUppercase = (value: string) => value === value.toLowerCase();
        // no _
        const noUnderscore = (value: string) => !value.includes('_');
        // suffix rules must not end with be -s3alias or --ol-s3
        const noSuffix = (value: string) => !value.endsWith('-s3alias') && !value.endsWith('--ol-s3');
        // prefix rules must not start with be xn--
        const noPrefix = (value: string) => !value.startsWith('xn--');

        return new DynamicValidator<string>(between3and63, startsWithLetterOrNumber, endsWithLetterOrNumber, noDot, noUppercase, noUnderscore, noSuffix, noPrefix);
    }
}

export default BucketNameValidator.Singleton;
