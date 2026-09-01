import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "transactions";

const INIT_TRANSACTIONS_TBL = `
    CREATE TABLE IF NOT EXISTS ${REPO} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        amount_bought INTEGER NOT NULL DEFAULT 0
            CHECK (amount_bought >= 0),

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        FOREIGN KEY (product_id)
            REFERENCES products(id)
            ON DELETE CASCADE
    );
`;

const GET_TRANSACTIONS_BY_USER: string = `
    SELECT * FROM ${REPO}
    WHERE user_id = ?
    ORDER BY created_at DESC;
`;

const ADD_TRANSACTION: string = `
    INSERT INTO ${REPO} (
        user_id,
        product_id,
        created_at,
        amount_bought
    )
    VALUES (
        ?,
        ?,
        ?,
        ?
    );
`;

type SQLTransaction = {
    id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    amount_bought: number
}

export type Transaction = {
    id: number;
    user_id: number;
    product_id: number;
    created_at: Date;
    amount_bought: number
}

type Queries = {
    initTransactionTbl: SQLiteStatement,
    transactionByUser: SQLiteStatement,
    addTransaction: SQLiteStatement,
}

export default class TransactionRepository {
    private readonly queries: Queries;
    constructor(queries: Queries) {
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<TransactionRepository> {
        try {
            await db.execAsync(INIT_TRANSACTIONS_TBL);
        } catch (reason) {
            const message = `${REPO}: ${reason}`;
            if (__DEV__) console.error(message);
            throw new Error(message);
        }
        const [initTransactionTbl, transactionByUser, addTransaction] = await Promise.all([
            compileSQL(db, INIT_TRANSACTIONS_TBL),
            compileSQL(db, GET_TRANSACTIONS_BY_USER),
            compileSQL(db, ADD_TRANSACTION),
        ]);

        const queries: Queries = {
            initTransactionTbl,
            transactionByUser,
            addTransaction,
        }

        return new TransactionRepository(queries);
    }
    async init() {
        try {
            const result = await this.queries.initTransactionTbl.executeAsync();

            if (__DEV__) console.log(`${REPO} changes: ${result.changes}`);
        } catch (reason) {
            throw new Error(`initTransactionTbl: ${reason}`);
        }
    }
    async getTransactionsByUser(name: string): Promise<Transaction[] | null> {
        const transactions = await this.queries.transactionByUser.executeAsync<SQLTransaction>(name)
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getProductByName: ${reason}`) 
            });

        if (__DEV__) console.log(JSON.stringify(transactions));

        return transactions.map(transaction => ({
            id: transaction.id,
            user_id: transaction.user_id,
            product_id: transaction.product_id,
            created_at: new Date(transaction.created_at),
            amount_bought: transaction.amount_bought,
        }));
    }
    async addTransaction(transaction: Transaction): Promise<void> {
        try {
            const result = await this.queries.addTransaction.executeAsync(
                transaction.user_id,
                transaction.product_id,
                transaction.created_at.toISOString(),
                transaction.amount_bought
            );

            if (__DEV__) console.log(`${REPO} changes: ${result.changes}`);
            if (result.changes === 0) throw new Error(`editProduct: ${transaction.id} was not updated`);
        
        } catch (reason) {
            throw new Error(`editProduct: ${reason}`);
        }
    }
}