export class Validator<T> {
    constructor(protected readonly rules: IRule<T>[]) {
    }

    public validate(object: T): boolean {
        //use for loop instead of forEach to avoid unnecessary iterations
        return this.rules.every(rule => rule.validate(object));
    }

    public async validateAsync(object: T): Promise<boolean> {
        let failed = false;
        const promises = this.rules.map(rule => {
            (async () => {
                if (rule.validate(object)) return Promise.resolve();
                failed = true;
                // reject the promise to stop the execution of the other rules
                return Promise.reject();
            })()
        })

        await Promise.all(promises);

        return !failed;
    }
}

export class DynamicValidator<T> extends Validator<T> {

    constructor(...rules: (IRule<T> | ImplicitRuleDelegate<T>)[]) {
        super([]);
        this.addRules(rules);
    }

    public addRule(rule: IRule<T> | ImplicitRuleDelegate<T>): void {
        if (typeof rule !== 'function') {
            this.rules.push(rule)
            return;
        }
        this.rules.push(new Rule(rule));
    }

    public addRules(rule: (IRule<T> | ImplicitRuleDelegate<T>)[]): void {
        rule.forEach(r => this.addRule(r));
    }

    public toImmutable(): ImmutableValidator<T> {
        return new ImmutableValidator(this.rules);
    }
}

export class ImmutableValidator<T> extends Validator<T> {
    constructor(rules: IRule<T>[]) {
        super([...rules]);
    }
}


export interface IRule<T> {
    validate: ImplicitRuleDelegate<T>
}

export class Rule<T> implements IRule<T> {
    constructor(public validate: ImplicitRuleDelegate<T>) {
    }
}

export class RuleGroup<T> implements IRule<T> {
    constructor(public rules: IRule<T>[]) {
    }

    validate(object: T): boolean {
        return this.rules.every(rule => rule.validate(object));
    }
}

interface ImplicitRuleDelegate<T> {
    (object: T): boolean
}
