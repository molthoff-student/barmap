import {
    FACTIONS,
    USERS,
    PRODUCTS,
    CREDIT,
    TRANSACTIONS,
} from "../database/db-init";

export type Row = Record<string, any>;
export type DbTable = { name: string; rows: Row[] };

type Codec = { encode: (v: any) => any; decode: (v: any) => any };
type Direction = "encode" | "decode";

const identity: Codec = { encode: (v) => v, decode: (v) => v };

const money: Codec = {
    encode: (v) => {
        if (!Number.isInteger(v)) {
            throw new Error(`expected integer cents, got ${JSON.stringify(v)}`);
        }
        return v / 100;
    },
    decode: (v) => {
        const n = typeof v === "number" ? v : Number(v);
        if (v === "" || v === null || !Number.isFinite(n)) {
            throw new Error(`expected a number, got ${JSON.stringify(v)}`);
        }
        return Math.round(n * 100);
    },
};

const bool: Codec = {
    encode: (v) => {
        if (v !== 0 && v !== 1) {
            throw new Error(`expected 0 or 1, got ${JSON.stringify(v)}`);
        }
        return v === 1;
    },
    decode: (v) => {
        if (v === true || v === "TRUE" || v === 1) return 1;
        if (v === false || v === "FALSE" || v === 0) return 0;
        throw new Error(`expected a boolean, got ${JSON.stringify(v)}`);
    },
};

type Field = { column: string; header: string; codec?: Codec };

type TableSchema = {
    table: string;
    sheet: string;
    fields: Field[];
    computed?: { header: string; compute: (row: Row) => any }[];
};

const serde = (
    column: string,
    header: string,
    codec: Codec = identity,
): Field => ({
    column,
    header,
    codec,
});

const SCHEMAS: TableSchema[] = [
    {
        table: FACTIONS,
        sheet: "Speltakken",
        fields: [
            serde("id", "ID"),
            serde("name", "Naam"),
            serde("active", "Actief", bool),
        ],
    },
    {
        table: USERS,
        sheet: "Gebruikers",
        fields: [
            serde("id", "ID"),
            serde("name", "Naam"),
            serde("given_money", "Inleg", money),
            serde("spent_money", "Uitgave", money),
            serde("faction", "Speltak"),
            serde("active", "Actief", bool),
        ],
        computed: [
            {
                header: "Balans",
                compute: (r) => (r.given_money - r.spent_money) / 100,
            },
        ],
    },
    {
        table: PRODUCTS,
        sheet: "Producten",
        fields: [
            serde("id", "ID"),
            serde("name", "Naam"),
            serde("price", "Prijs", money),
            serde("active", "Actief", bool),
        ],
    },
    {
        table: CREDIT,
        sheet: "Krediet",
        fields: [
            serde("id", "ID"),
            serde("user_id", "Gebruiker ID"),
            serde("given_money", "Inleg", money),
            serde("created_at", "Datum"),
        ],
    },
    {
        table: TRANSACTIONS,
        sheet: "Transacties",
        fields: [
            serde("id", "ID"),
            serde("user_id", "Gebruiker ID"),
            serde("product_id", "Product ID"),
            serde("amount_bought", "Aantal"),
            serde("amount_spent", "Kosten", money),
            serde("created_at", "Datum"),
        ],
    },
];

const byTable = new Map(SCHEMAS.map((s) => [s.table, s]));
const bySheet = new Map(SCHEMAS.map((s) => [s.sheet, s]));

function convertRow(
    schema: TableSchema,
    row: Row,
    index: number,
    dir: Direction,
): Row {
    const out: Row = {};

    for (const field of schema.fields) {
        const [src, dst] =
            dir === "encode"
                ? [field.column, field.header]
                : [field.header, field.column];

        const where = `${schema.sheet}, row ${index + 1}, "${src}"`;

        const value = row[src];
        if (value === undefined) {
            throw new Error(`${where}: required value is missing`);
        }

        try {
            out[dst] = (field.codec ?? identity)[dir](value);
        } catch (reason: any) {
            throw new Error(`${where}: ${reason.message}`);
        }
    }

    return out;
}

export function serialize(name: string, rows: Row[]): DbTable {
    const schema = byTable.get(name);
    if (!schema) return { name, rows };

    return {
        name: schema.sheet,
        rows: rows.map((row, i) => {
            const out = convertRow(schema, row, i, "encode");
            for (const { header, compute } of schema.computed ?? []) {
                out[header] = compute(row);
            }
            return out;
        }),
    };
}

export function deserialize(name: string, rows: Row[]): DbTable {
    const schema = bySheet.get(name);
    if (!schema) return { name, rows };

    return {
        name: schema.table,
        rows: rows.map((row, i) => convertRow(schema, row, i, "decode")),
    };
}
