import { SQLiteDatabase } from "expo-sqlite";

export const FACTIONS: string = "factions";
export const USERS: string = "users";
export const CREDIT: string = "credit";
export const PRODUCTS: string = "products";
export const TRANSACTIONS: string = "transactions";

const CREATE_FACTIONS_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${FACTIONS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1))
    );
`;

const CREATE_USER_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${USERS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        given_money INTEGER NOT NULL DEFAULT 0,
        spent_money INTEGER NOT NULL DEFAULT 0,
        faction TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 1
            CHECK (active IN (0, 1)),

        FOREIGN KEY (faction)
            REFERENCES factions(name)
            ON UPDATE CASCADE
    );
`;

const CREATE_CREDIT_TABLE: string = `
    CREATE TABLE IF NOT EXISTS ${CREDIT} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        given_money INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );
`;

const UPDATE_USER_TRIGGER: string = `
    CREATE TRIGGER IF NOT EXISTS update_user_trigger
    AFTER UPDATE OF given_money ON ${USERS}
    FOR EACH ROW
    WHEN NEW.given_money != OLD.given_money
    BEGIN
        INSERT INTO ${CREDIT} (user_id, given_money)
        VALUES (
            NEW.id,
            NEW.given_money - OLD.given_money
        );
    END;
`;

const INSERT_USER_TRIGGER: string = `
    CREATE TRIGGER IF NOT EXISTS insert_user_trigger
    AFTER INSERT ON ${USERS}
    FOR EACH ROW
    BEGIN
        INSERT INTO ${CREDIT} (user_id, given_money)
        VALUES (
            NEW.id,
            NEW.given_money - NEW.spent_money
        );
    END;
`;

const CREATE_PRODUCT_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${PRODUCTS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1))
    );
`;

const CREATE_TRANSACTIONS_TBL = `
    CREATE TABLE IF NOT EXISTS ${TRANSACTIONS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        amount_spent INTEGER NOT NULL DEFAULT 0
            CHECK (amount_spent >= 0),
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

const INSERT_TRANSACTIONS_TRIGGER: string = `
    CREATE TRIGGER IF NOT EXISTS insert_transaction_trigger
    AFTER INSERT ON ${TRANSACTIONS}
    FOR EACH ROW
    BEGIN
        UPDATE ${USERS}
        SET spent_money = spent_money + NEW.amount_spent
        WHERE id = NEW.user_id;
    END;
`;

const INIT_PRAGMAS: string = `
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
`;

async function runSqlAsync(
    db: SQLiteDatabase,
    code: string,
    name: string,
): Promise<void> {
    await db
        .runAsync(code)
        .then(() => {
            if (__DEV__) {
                console.log(`${name}: ran without errors`);
            }
        })
        .catch((reason: any) => {
            throw new Error(`${name}: ${reason.message ?? "No reason given"}`);
        });
}

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
    await runSqlAsync(db, INIT_PRAGMAS, "CREATE_PRAGMAS");
    await runSqlAsync(db, CREATE_FACTIONS_TBL, "CREATE_FACTIONS_TBL");
    await runSqlAsync(db, CREATE_USER_TBL, "CREATE_USER_TBL");
    await runSqlAsync(db, CREATE_PRODUCT_TBL, "CREATE_PRODUCT_TBL");
    await runSqlAsync(db, CREATE_CREDIT_TABLE, "CREATE_CREDIT_TABLE");
    await runSqlAsync(db, CREATE_TRANSACTIONS_TBL, "CREATE_TRANSACTIONS_TBL");
    await runSqlAsync(db, UPDATE_USER_TRIGGER, "UPDATE_USER_TRIGGER");
    await runSqlAsync(db, INSERT_USER_TRIGGER, "INSERT_USER_TRIGGER");
    await runSqlAsync(
        db,
        INSERT_TRANSACTIONS_TRIGGER,
        "INSERT_TRANSACTIONS_TRIGGER",
    );
}
