import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";
import { TRANSACTIONS as REPO } from "../db-init";

if (__DEV__) console.log("TRANSACTIONS / REPO =", REPO);

const GET_ALL_TRANSACTIONS: string = `
    SELECT * FROM ${REPO}
    ORDER BY created_at DESC;
`;

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

const GET_MOST_BOUGHT_BY_USERS: string = `
    WITH ranked_transactions AS (
        SELECT
            transactions.user_id AS user_id,
            users.name AS user_name,
            transactions.product_id AS product_id,
            products.name AS product_name,
            SUM(transactions.amount_bought) AS total_bought,
            SUM(transactions.amount_spent) AS total_spent,
            ROW_NUMBER() OVER (
                PARTITION BY transactions.user_id
                ORDER BY SUM(transactions.amount_bought) DESC
            ) AS purchase_rank
        FROM ${REPO} transactions
        JOIN products ON products.id = transactions.product_id
        JOIN users ON users.id = transactions.user_id
        GROUP BY
            transactions.user_id,
            users.name,
            transactions.product_id,
            products.name
    )
    SELECT user_name, product_name, total_bought, total_spent
    FROM ranked_transactions
    WHERE purchase_rank = 1
    ORDER BY user_name;
`;

export type SQLTransaction = {
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
    user_name: string;
    product_name: string;
    total_bought: number;
    total_spent: number;
};

export type TransactionStat = {
    user_name: string;
    product_name: string;
    total_bought: number;
    total_spent: Currency;
};

function sqlToTransaction(sql: SQLTransaction | null): Transaction | null {
    if (sql == null) return null;
    const invalid = Object.values(sql).some((value) => value == null);
    if (invalid) return null;
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
    if (sql == null) return null;
    const invalid = Object.values(sql).some((value) => value == null);
    if (invalid) return null;
    return {
        user_name: sql.user_name,
        product_name: sql.product_name,
        total_bought: sql.total_bought,
        total_spent: new Currency(sql.total_spent),
    };
}

type Queries = {
    getAllTransactions: SQLiteStatement;
    transactionByUser: SQLiteStatement;
    insertTransaction: SQLiteStatement;
    // updateUserSpent: SQLiteStatement;
    getMostBoughtByUsers: SQLiteStatement;
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
            getAllTransactions,
            transactionByUser,
            insertTransaction,
            getMostBoughtByUsers,
        ] = await Promise.all([
            compileSQL(db, GET_ALL_TRANSACTIONS),
            compileSQL(db, GET_TRANSACTIONS_BY_USER),
            compileSQL(db, INSERT_TRANSACTION),
            compileSQL(db, GET_MOST_BOUGHT_BY_USERS),
        ]);

        if (__DEV__) console.log(`TransactionRepository queries compiled.`);

        const queries: Queries = {
            getAllTransactions,
            transactionByUser,
            insertTransaction,
            // updateUserSpent,
            getMostBoughtByUsers,
        };

        if (__DEV__)
            console.log(
                `TransactionRepository created with queries: ${JSON.stringify(queries)}`,
            );
        return new TransactionRepository(queries, db);
    };
    getAllTransactions = async (): Promise<Transaction[]> => {
        const transactions = await this.queries.getAllTransactions
            .executeAsync<SQLTransaction>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getAllTransactions: ${reason.message}`);
            });

        return transactions.map(
            (transaction) => sqlToTransaction(transaction)!,
        );
    };
    getTransactionsByUser = async (name: string): Promise<Transaction[]> => {
        const transactions = await this.queries.transactionByUser
            .executeAsync<SQLTransaction>(name)
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getTransactionsByUser: ${reason.message}`);
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

    getMostBoughtByUsers = async (): Promise<TransactionStat[]> => {
        const stats = await this.queries.getMostBoughtByUsers
            .executeAsync<SQLTransactionStat>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(
                    `getMostBoughtByUsers query: ${reason.message}`,
                );
            });

        // if (__DEV__) console.log(`getMostBoughtByUsers: ${JSON.stringify(stats)}`);

        return stats.map((value) => sqlToTransactionStat(value)!);
    };
}
