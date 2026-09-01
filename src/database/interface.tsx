import * as SQLite from 'expo-sqlite';
import Currency from '../currency';
import UserRepository, { User } from './repositories/users';
import ProductRepository, { Product } from './repositories/products';
import FactionRepository from './repositories/factions';
import TransactionRepository from './repositories/transactions';

const INSERT_TEST_DATA = true;
const databaseName = "barmap-database";

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
    readonly transactions: TransactionRepository;
    constructor(
        db: SQLite.SQLiteDatabase,
        users: UserRepository,
        products: ProductRepository,
        factions: FactionRepository,
        transactions: TransactionRepository
    ) {
        this.inner = db;
        this.users = users;
        this.products = products;
        this.factions = factions;
        this.transactions = transactions;
    }
    static async create(): Promise<Database> {
        if (__DEV__ && INSERT_TEST_DATA) {
            await SQLite.deleteDatabaseAsync(databaseName)
                .catch((reason) => {
                    if (__DEV__) console.log(reason);
                    // throw new Error(reason);
                });
        }

        const db = await SQLite.openDatabaseAsync(databaseName);

        if (__DEV__) console.log("opened database...");
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
        `);
        if (__DEV__) console.log("initialized PRAGMA's...");
        const factions = await FactionRepository.create(db);
        if (__DEV__) console.log("created FactionRepository...");
        const users = await UserRepository.create(db);
        if (__DEV__) console.log("created UserRepository...");
        const products = await ProductRepository.create(db);
        if (__DEV__) console.log("created ProductRepository...");
        const transactions = await TransactionRepository.create(db);
        if (__DEV__) console.log("created TransactionRepository...");

        if (__DEV__&& INSERT_TEST_DATA) {
            let i = 0;
            for (const faction of TEST_FACTION_LIST) {
                try {
                    await factions.addFaction(faction);
                } catch (reason) {
                    const message = `Database: ${reason}`;
                    if (__DEV__) console.error(message);
                    throw new Error(message);
                }

                for (const user of TEST_USER_LIST) {
                    try {
                        const data: User = {
                            id: 0,
                            username: user.username + i.toString(),
                            given_money: user.given_money,
                            spent_money: user.spent_money,
                            balance: user.given_money.sub(user.spent_money),
                            faction,
                        }
                        await users.addUser(data);
                    } catch (reason) {
                        const message = `Database: ${reason}`;
                        if (__DEV__) console.error(message);
                        throw new Error(message);
                    }
                }
                i += 1;
            }

            for (const product of TEST_PRODUCT_LIST) {
                try {
                    const data: Product = {
                        id: 0,
                        price: product.price.value,
                        active: product.active,
                        name: product.name,
                    }
                    await products.addProduct(data);
                } catch (reason) {
                    const message = `Database: ${reason}`;
                    if (__DEV__) console.error(message);
                    throw new Error(message);
                }
            }
        }
        
        return new Database(
            db,
            users,
            products,
            factions,
            transactions,
        );
    }
}