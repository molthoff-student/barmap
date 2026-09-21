import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";
import { TRANSACTIONS as REPO } from "../db-init";

if (__DEV__) console.log("TRANSACTIONS / REPO =", REPO);

const GET_TRANSACTIONS_BY_USER: string = `
    SELECT * FROM ${REPO}
    WHERE user_id = ?
    ORDER BY created_at DESC;
`;

const INSERT_TRANSACTION = `
    INSERT INTO ${REPO} (
        user_id,
        product_id,
        amount_spent,
        amount_bought
    )
    VALUES (?, ?, ?, ?);
`;

const GET_MOST_BOUGHT_BY_USER: string = `
    SELECT
        t.user_id,
        t.product_id,
        p.name AS product_name,
        SUM(t.amount_bought) AS total_bought,
        SUM(t.amount_spent) AS total_spent
    FROM ${REPO} t
    JOIN products p ON p.id = t.product_id
    WHERE t.user_id = ?
    GROUP BY t.user_id, t.product_id, p.name
    ORDER BY total_bought DESC
    LIMIT 1;
`;

type SQLTransaction = {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    amount_spent: number;
    amount_bought: number;
};

export type Transaction = {
    id: number;
    user_id: number;
    product_id: number;
    created_at: Date;
    amount_spent: Currency;
    amount_bought: number;
};

type SQLTransactionStat = {
    user_id: number;
    product_id: number;
    product_name: string;
    total_bought: number;
    total_spent: number;
};

export type TransactionStat = {
    user_id: number;
    product_id: number;
    product_name: string;
    total_bought: number;
    total_spent: Currency;
};

function sqlToTransaction(sql: SQLTransaction | null): Transaction | null {
    if (!sql) return null;
    return {
        id: sql.id,
        user_id: sql.user_id,
        product_id: sql.product_id,
        created_at: new Date(sql.created_at.replace("", "T") + "Z"),
        amount_spent: new Currency(sql.amount_spent),
        amount_bought: sql.amount_bought,
    };
}

function sqlToTransactionStat(
    sql: SQLTransactionStat | null,
): TransactionStat | null {
    if (!sql) return null;
    return {
        user_id: sql.user_id,
        product_id: sql.product_id,
        product_name: sql.product_name,
        total_bought: sql.total_bought,
        total_spent: new Currency(sql.total_spent),
    };
}

type Queries = {
    transactionByUser: SQLiteStatement;
    insertTransaction: SQLiteStatement;
    // updateUserSpent: SQLiteStatement;
    getMostBoughtByUser: SQLiteStatement;
};

export default class TransactionRepository {
    private readonly queries: Queries;
    private readonly db: SQLiteDatabase;
    constructor(queries: Queries, db: SQLiteDatabase) {
        this.queries = queries;
        this.db = db;
    }
    static create = async (
        db: SQLiteDatabase,
    ): Promise<TransactionRepository> => {
        if (__DEV__) console.log(`TransactionRepository created.`);
        const [
            transactionByUser,
            insertTransaction,
            // updateUserSpent,
            getMostBoughtByUser,
        ] = await Promise.all([
            compileSQL(db, GET_TRANSACTIONS_BY_USER),
            compileSQL(db, INSERT_TRANSACTION),
            // compileSQL(db, UPDATE_USER_SPENT),
            compileSQL(db, GET_MOST_BOUGHT_BY_USER),
        ]);

        if (__DEV__) console.log(`TransactionRepository queries compiled.`);

        const queries: Queries = {
            transactionByUser,
            insertTransaction,
            // updateUserSpent,
            getMostBoughtByUser,
        };

        if (__DEV__)
            console.log(
                `TransactionRepository created with queries: ${JSON.stringify(queries)}`,
            );
        return new TransactionRepository(queries, db);
    };
    getTransactionsByUser = async (
        name: string,
    ): Promise<Transaction[] | null> => {
        const transactions = await this.queries.transactionByUser
            .executeAsync<SQLTransaction>(name)
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getProductByName: ${reason}`);
            });

        if (__DEV__)
            console.log(
                `${REPO} getTransactionsByUser: ${JSON.stringify(transactions)}`,
            );

        return transactions.map(
            (transaction) => sqlToTransaction(transaction)!,
        );
    };
    addTransaction = async (transaction: Transaction): Promise<number> => {
        const id = await this.queries.insertTransaction
            .executeAsync(
                transaction.user_id,
                transaction.product_id,
                transaction.amount_spent.value,
                transaction.amount_bought,
            )
            .then((res) => {
                return res.changes === 0 ? null : res.lastInsertRowId;
            });

        if (id) return id;
        throw new Error(`Transaction was not added`);
    };
    getMostBoughtByUser = async (
        userId: number,
    ): Promise<TransactionStat | null> => {
        try {
            const stat = await this.queries.getMostBoughtByUser
                .executeAsync<SQLTransactionStat>(userId)
                .then((result) => result.getFirstAsync())
                .catch((reason) => {
                    throw new Error(`getMostBoughtByUser query: ${reason}`);
                });

            // if (__DEV__) console.log(`getMostBoughtByUser: ${JSON.stringify(stat)}`);
            return sqlToTransactionStat(stat);
        } catch (reason) {
            throw new Error(`getMostBoughtByUser: ${reason}`);
        }
    };
}
