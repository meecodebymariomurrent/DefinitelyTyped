import Helper, { helper } from '@ember/component/helper';

class DeprecatedSignatureForm extends Helper<{
    PositionalArgs: [offset: Date];
    Return: Date;
}> {
    timer?: ReturnType<typeof setInterval> | undefined;
    now = new Date();
    init() {
        super.init();
        this.timer = setInterval(() => {
            this.set('now', new Date());
            this.recompute();
        }, 100);
    }
    compute([offset]: [Date]): Date {
        return new Date(this.now.getTime() + offset.getTime());
    }
    willDestroy() {
        clearInterval(this.timer);
    }
}

interface DemoSig {
    Args: {
        Named: {
            name: string;
            age: number;
        };
        Positional: [i18nizer: (s: string) => string];
    };
    Return: string;
}

class SignatureForm extends Helper<DemoSig> {
    compute([i18nizer]: [i18nizer: (s: string) => string], { name, age }: { name: string; age: number }): string {
        return i18nizer(`${name} is ${age} years old`);
    }
}

class BadPosSigForm extends Helper<DemoSig> {
    compute(
        // $ExpectError
        [i18nizer, extra]: [i18nizer: (s: string) => string],
        { name, age }: { name: string; age: number },
    ): string {
        return i18nizer(`${name} is ${age} years old`);
    }
}

class BadNamedSigForm extends Helper<DemoSig> {
    compute(
        [i18nizer]: [i18nizer: (s: string) => string],
        // $ExpectError
        { name, age, potato }: { name: string; age: number },
    ): string {
        return i18nizer(`${name} is ${age} years old`);
    }
}

class BadReturnForm extends Helper<DemoSig> {
    compute([i18nizer]: [i18nizer: (s: string) => string], { name, age }: { name: string; age: number }): string {
        // $ExpectError
        return Boolean(i18nizer(`${name} is ${age} years old`));
    }
}

// $ExpectType FunctionBasedHelper<{ Args: { Positional: [number, number]; Named: EmptyObject; }; Return: number; }>
const inferenceOnPositional = helper(function add([a, b]: [number, number]) {
    return a + b;
});

const coolHelper = helper(([], named) => {
    // $ExpectType EmptyObject
    named;
});

// $ExpectType FunctionBasedHelper<{ Args: { Positional: DefaultPositional; Named: { cool: boolean; }; }; Return: 123 | "neat"; }>
const typeInferenceOnNamed = helper(([], { cool }: { cool: boolean }) => {
    // $ExpectType boolean
    cool;

    return cool ? 123 : 'neat';
});

// $ExpectType FunctionBasedHelper<{ Args: { Positional: [string]; Named: { delim?: string; }; }; Return: string; }>
const dasherizeHelper = helper(function dasherize([str]: [string], { delim = '-' }: { delim?: string }) {
    return str.split(/[\s\n\_\.]+/g).join(delim);
});

const signatureForm = helper<DemoSig>(([i18nizer], { name, age }) => i18nizer(`${name} is ${age} years old`));

// $ExpectError
const badPosArgsSig = helper<DemoSig>(([i18nizer, extra], { name, age }) => i18nizer(`${name} is ${age} years old`));

// $ExpectError
const badNamedArgsSig = helper<DemoSig>(([i18nizer], { name, age, potato }) => i18nizer(`${name} is ${age} years old`));

// $ExpectError
const badReturnSig = helper<DemoSig>(([i18nizer], { name, age }) => Boolean(i18nizer(`${name} is ${age} years old`)));
