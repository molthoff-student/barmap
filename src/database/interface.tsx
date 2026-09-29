import * as SQLite from "expo-sqlite";
import UserRepository from "./repositories/users";
import ProductRepository from "./repositories/products";
import FactionRepository from "./repositories/factions";
import TransactionRepository from "./repositories/transactions";
import { initDatabase } from "./db-init";
import { insertTestData } from "./testing";
import CreditsRepository from "./repositories/credits";

const databaseName = "barmap-database";

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
    const db = await SQLite.openDatabaseAsync(databaseName);
    if (!__DEV__) return db;

    await db.closeAsync();
    await SQLite.deleteDatabaseAsync(databaseName);
    return await SQLite.openDatabaseAsync(databaseName);
}

export default class Database {
    readonly inner: SQLite.SQLiteDatabase;
    readonly users: UserRepository;
    readonly products: ProductRepository;
    readonly factions: FactionRepository;
    readonly transactions: TransactionRepository;
    readonly credits: CreditsRepository;
    constructor(
        db: SQLite.SQLiteDatabase,
        users: UserRepository,
        products: ProductRepository,
        factions: FactionRepository,
        transactions: TransactionRepository,
        credits: CreditsRepository,
    ) {
        this.inner = db;
        this.users = users;
        this.products = products;
        this.factions = factions;
        this.transactions = transactions;
        this.credits = credits;
    }
    static async create(): Promise<Database> {
        let db = await openDatabase();

        if (__DEV__) console.log("opened database...");
        // if (__DEV__) console.log(`initializing database:\n${INIT_DATABASE}`);
        try {
            await initDatabase(db);
        } catch (reason: any) {
            if (__DEV__)
                console.error(
                    `failed to initalize database: ${reason.message ?? "No reason given."}`,
                );
        }

        if (__DEV__) console.log("initialized database...");
        const factions = await FactionRepository.create(db);
        if (__DEV__) console.log("created FactionRepository...");
        const users = await UserRepository.create(db);
        if (__DEV__) console.log("created UserRepository...");
        const products = await ProductRepository.create(db);
        if (__DEV__) console.log("created ProductRepository...");
        const transactions = await TransactionRepository.create(db);
        if (__DEV__) console.log("created TransactionRepository...");
        const credits = await CreditsRepository.create(db);
        if (__DEV__) console.log("created CreditsRepository...");

        if (__DEV__) {
            await insertTestData(factions, users, products);
            console.log("Added test data");
        }

        return new Database(
            db,
            users,
            products,
            factions,
            transactions,
            credits,
        );
    }
}
