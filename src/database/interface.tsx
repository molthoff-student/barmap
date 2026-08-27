import * as SQLite from 'expo-sqlite';
import Currency from '../currency';
import UserRepository from './repositories/users';
import ProductRepository from './repositories/products';
import FactionRepository from './repositories/factions';

const databaseName = "barmap-database";

const INIT_FACTIONS_TBL: string = `
    CREATE TABLE IF NOT EXISTS factions (
        faction TEXT PRIMARY KEY
    );
`;

const INIT_USER_TBL: string = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        given_money INTEGER NOT NULL DEFAULT 0,
        spent_money INTEGER NOT NULL DEFAULT 0,
        faction TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1)),

        FOREIGN KEY (faction)
            REFERENCES factions(faction)
    );
`;

const INIT_PRODUCT_TBL: string = `
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1))
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

const DEFAULT_GIVEN: Currency = new Currency({ integer: 10000, decimal: 0 });
const DEFAULT_SPENT: Currency = new Currency({ integer: 50, decimal: 0 });
const DEFAULT_PRICE: Currency = new Currency({ integer: 1, decimal: 0 });

const TEST_FACTION_LIST = [
    "Wilde Vaart",
    "Leiding",
    "Zeeverkenner",
    "Stam",
    "Gasten",
    "Clubs"
]

const TEST_USER_LIST = [
    { username: "Mick Olthoff", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT },
    { username: "Noah Faas", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Cas Kluiters", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Gerco Hogeveen", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Piet Klaas", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Joep Van Der Velde", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Theo Turbo", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Bram", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Owen Huijskes", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Rutger Pax", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "Cay Noya", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
    { username: "16characters1234", given_money: DEFAULT_GIVEN, spent_money: DEFAULT_SPENT  },
];

const TEST_PRODUCT_LIST = [
    { name: "Fris", price: DEFAULT_PRICE, active: true },
    { name: "Bier", price: DEFAULT_PRICE, active: true },
    { name: "Chips", price: DEFAULT_PRICE, active: true },
    { name: "Snacks", price: DEFAULT_PRICE, active: true },
];

export default class Database {
    readonly inner: SQLite.SQLiteDatabase;
    readonly users: UserRepository;
    readonly products: ProductRepository;
    readonly factions: FactionRepository;

    constructor(
        db: SQLite.SQLiteDatabase,
        users: UserRepository,
        products: ProductRepository,
        factions: FactionRepository,
    ) {
        this.inner = db;
        this.users = users;
        this.products = products;
        this.factions = factions;
    }
    static async create(): Promise<Database> {
        if (false) {
            await SQLite.deleteDatabaseAsync(databaseName)
                .catch((reason) => {
                    if (__DEV__) console.log(reason);
                    // throw new Error(reason);
                });
        }

        const db = await SQLite.openDatabaseAsync(databaseName);

        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
            ${INIT_FACTIONS_TBL}
            ${INIT_USER_TBL}
            ${INIT_PRODUCT_TBL}
            ${INIT_STATISTICS_TBL}
        `);

        if (false) {
            let i = 0;
            for (const faction of TEST_FACTION_LIST) {
                await db.runAsync(
                    `INSERT INTO factions (faction) VALUES (?);`,
                    faction
                ).then(result => {
                    if (__DEV__) console.log("faction: " + JSON.stringify(result))
                })
                .catch(reason => {if (__DEV__) console.log(`TEST_FACTION_LIST: ${reason}`)});

                for (const user of TEST_USER_LIST) {
                    await db.runAsync(
                        `INSERT INTO users (
                            username,
                            given_money,
                            spent_money,
                            faction
                        ) VALUES (?, ?, ?, ?);`,
                        user.username + i.toString(),
                        user.given_money.value,
                        user.spent_money.value,
                        faction
                    ).then(result => {
                        if (__DEV__) console.log("users: " + JSON.stringify(result))
                    })
                    .catch(reason => {if (__DEV__) console.log(`TEST_USER_LIST: ${reason}`)});
                }
                i += 1;
            }

            for (const product of TEST_PRODUCT_LIST) {
                await db.runAsync(
                    `INSERT INTO products (
                        name,
                        price,
                        active
                    ) VALUES (?, ?, ?);`,
                    product.name,
                    product.price.value,
                    product.active ? 1 : 0,
                ).then(result => {
                    if (__DEV__) console.log("products: " + JSON.stringify(result))
                })
                .catch(reason => {if (__DEV__) console.log(`TEST_PRODUCT_LIST: ${reason}`)});
            }
        }

        const users = await UserRepository.create(db);
        const products = await ProductRepository.create(db);
        const factions = await FactionRepository.create(db);
        
        return new Database(
            db,
            users,
            products,
            factions,
        );
    }
}