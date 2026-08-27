type Value = number | {
    integer: number;
    decimal: number;
};

function validateValue(value: Value): number {
    if (typeof value === "number") {
        if (!Number.isInteger(value)) {
            throw new Error("Currency value must be a whole number.");
        }

        return value;
    }

    if (!Number.isInteger(value.integer)) {
        throw new Error("Currency integer must be a whole number.");
    }

    if (!Number.isInteger(value.decimal) || value.decimal < 0 || value.decimal > 99) {
        throw new Error("Currency decimal must be a whole number between 0 and 99.");
    }

    return value.integer * 100 + value.decimal;
}

export default class Currency {
    #value: number;

    constructor();
    constructor(value: Value);
    constructor(value: Value = 0) {
        this.#value = validateValue(value);
    }

    get value(): number {
        return this.#value;
    }

    set value(value: Value) {
        this.#value = validateValue(value);
    }

    toString(len = 8): string {
        const value = this.#value / 100;
        return "€" + value.toFixed(2).padStart(len);
    }
}