import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";
import { CREDIT as REPO } from "../db-init";

if (__DEV__) console.log("TRANSACTIONS / REPO =", REPO);

const GET_ALL_CREDITS: string = `
    SELECT * FROM ${REPO}
    ORDER BY created_at DESC;
`;

export type SQLCredit = {
    id: number;
    user_id: number;
    given_money: number;
    created_at: string;
};

export type Credit = {
    id: number;
    user_id: number;
    given_money: Currency;
    created_at: Date;
};

export function sqlToCredit(sql: SQLCredit | null): Credit | null {
    if (sql == null) return null;
    const invalid = Object.values(sql).some((value) => value == null);
    if (invalid) return null;
    return {
        id: sql.id,
        user_id: sql.user_id,
        given_money: new Currency(sql.given_money),
        created_at: new Date(sql.created_at.replace("", "T") + "Z"),
    };
}

type Queries = {
    getAllCredit: SQLiteStatement;
};

export default class CreditsRepository {
    private readonly queries: Queries;
    private readonly db: SQLiteDatabase;
    constructor(queries: Queries, db: SQLiteDatabase) {
        this.queries = queries;
        this.db = db;
    }
    static create = async (db: SQLiteDatabase): Promise<CreditsRepository> => {
        const [getAllCredit] = await Promise.all([
            compileSQL(db, GET_ALL_CREDITS),
        ]);
        const queries: Queries = {
            getAllCredit,
        };
        return new CreditsRepository(queries, db);
    };
    getAllCredits = async (): Promise<Credit[]> => {
        const credits = await this.queries.getAllCredit
            .executeAsync<SQLCredit>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getAllCredits: ${reason.message}`);
            });

        if (__DEV__)
            console.log(`${REPO} getAllCredits: ${JSON.stringify(credits)}`);

        return credits.map((credit) => sqlToCredit(credit)!);
    };
}
