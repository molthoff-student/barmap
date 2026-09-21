import * as SQLite from "expo-sqlite";
import Currency from "../currency";
import UserRepository, { User } from "./repositories/users";
import ProductRepository, { Product } from "./repositories/products";
import FactionRepository from "./repositories/factions";
import TransactionRepository, {
    Transaction,
} from "./repositories/transactions";
import { initDatabase } from "./db-init";

const INSERT_TEST_DATA = true;
const databaseName = "barmap-database";

const rngGiven = () =>
    new Currency(Math.floor(Math.random() * (10000 - 1000) + 1000));
const rngBought = () => Math.floor(Math.random() * (100 - 1) + 1);
const DEFAULT_SPENT: Currency = new Currency();
const DEFAULT_PRICE: Currency = new Currency({ integer: 1, decimal: 0 });

const TEST_FACTION_LIST = [
    "Wilde Vaart",
    "Leiding",
    "Zeeverkenner",
    "Stam",
    "Gasten",
    "Clubs",
];

const TEST_USER_LIST = [
    {
        name: "Mick Olthoff",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Noah Faas",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Cas Kluiters",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Gerco Hogeveen",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Piet Klaas",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Joep Van Der Velde",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Theo Turbo",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Bram",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Owen Huijskes",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Rutger Pax",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "Cay Noya",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
    {
        name: "16characters1234",
        given_money: DEFAULT_SPENT,
        spent_money: DEFAULT_SPENT,
    },
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
        transactions: TransactionRepository,
    ) {
        this.inner = db;
        this.users = users;
        this.products = products;
        this.factions = factions;
        this.transactions = transactions;
    }
    static async create(): Promise<Database> {
        if (__DEV__ && INSERT_TEST_DATA) {
            await SQLite.deleteDatabaseAsync(databaseName).catch((reason) => {
                if (__DEV__)
                    console.log(`failed to delete database: ${reason}`);
                // throw new Error(reason);
            });
        }

        const db = await SQLite.openDatabaseAsync(databaseName);

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

        if (__DEV__ && INSERT_TEST_DATA) {
            for (const product of TEST_PRODUCT_LIST) {
                try {
                    const data: Product = {
                        id: 0,
                        price: product.price,
                        active: product.active,
                        name: product.name,
                    };
                    await products.addProduct(data);
                } catch (reason) {
                    const message = `Database: ${reason}`;
                    if (__DEV__) console.error(message);
                    throw new Error(message);
                }
            }

            const product = 1;
            const product_id =
                (await products
                    .getProductByName(TEST_PRODUCT_LIST[product].name)
                    .then((product) => product?.id)
                    .catch((reason) => {
                        const message = `Database: ${reason}`;
                        if (__DEV__) console.error(message);
                        throw new Error(message);
                    })) ?? 0;

            let i = 0;
            for (const faction of TEST_FACTION_LIST) {
                try {
                    await factions.addFaction({
                        id: 0,
                        name: faction,
                        active: true,
                    });
                } catch (reason) {
                    const message = `Database: ${reason}`;
                    if (__DEV__) console.error(message);
                    throw new Error(message);
                }

                for (const user of TEST_USER_LIST) {
                    try {
                        const given_money = rngGiven();
                        const data: User = {
                            id: 0,
                            name: user.name + " " + i.toString(),
                            given_money,
                            spent_money: user.spent_money,
                            balance: given_money.sub(user.spent_money),
                            faction,
                        };
                        const user_id = await users.addUser(data);
                        const amount_bought = rngBought();
                        const transaction: Transaction = {
                            id: 0,
                            user_id,
                            product_id: product_id,
                            amount_spent:
                                TEST_PRODUCT_LIST[product].price.mul(
                                    amount_bought,
                                ),
                            amount_bought,
                            created_at: new Date(),
                        };

                        await transactions.addTransaction(transaction);
                    } catch (reason) {
                        const message = `Database: ${reason}`;
                        if (__DEV__) console.error(message);
                        throw new Error(message);
                    }
                }
                i += 1;
            }
        }

        return new Database(db, users, products, factions, transactions);
    }
}
