import * as SQLite from 'expo-sqlite';
import UserRepository from './repositories/users';

const databaseName = "barmap-database";

const INIT_USER_TBL: string = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        given_money INTEGER NOT NULL DEFAULT 0,
        spent_money INTEGER NOT NULL DEFAULT 0,
        faction TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1))
    );
`;

const INIT_PRODUCT_TBL: string = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL DEFAULT 0,
        in_stock INTEGER NOT NULL DEFAULT 0
            CHECK (in_stock IN (0, 1))
    );
`;

const INIT_STATISTICS_TBL: string = `
    CREATE TABLE IF NOT EXISTS statistics (
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        amount_bought INTEGER NOT NULL DEFAULT 0
            CHECK (amount_bought >= 0),

        PRIMARY KEY (user_id, product_id),

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,

        FOREIGN KEY (product_id)
            REFERENCES products(id)
            ON DELETE CASCADE
    );
`;

const TEST_USERS: string = `
    
`;

async function initDatabase(): Promise<SQLite.SQLiteDatabase> {

    if (__DEV__) {
        await SQLite.deleteDatabaseAsync(databaseName)
            .catch((reason) => {
                console.log(reason);
                // throw new Error(reason);
            });
    }

    const db = await SQLite.openDatabaseAsync(databaseName);

    await db.execAsync(`
        PRAGMA journal_mode = WAL;
        ${INIT_USER_TBL}
        ${INIT_PRODUCT_TBL}
        ${INIT_STATISTICS_TBL}
    `);

    if (__DEV__) {

    }

    return db;
}

export default class DataBase {
    readonly users: UserRepository;
    constructor(db: SQLite.SQLiteDatabase) {
        this.users = new UserRepository(db);
    }
    static async create(): Promise<DataBase> {
        const db = await initDatabase();
        return new DataBase(db);
    }
}