import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "products";

const INIT_PRODUCT_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${REPO} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        price INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1))
    );
`;

const GET_PRODUCT_BY_NAME: string = `
    SELECT * FROM ${REPO}
    WHERE name = ?
`;

const GET_PRODUCT_BY_ACTIVITY: string = `
    SELECT * FROM ${REPO}
    WHERE active = ?
    ORDER BY name
`;

const EDIT_PRODUCT: string = `
    UPDATE ${REPO}
    SET
        price = ?,
        active = ?,
        name = ?
    WHERE id = ?;
`;

const ADD_PRODUCT: string = `
    INSERT INTO ${REPO} (
        price,
        active,
        name
    ) VALUES (
        ?,
        ?,
        ?
    );
`;

type Queries = {
    init: SQLiteStatement,
    productByName: SQLiteStatement,
    productByActivity: SQLiteStatement,
    editProduct: SQLiteStatement,
    addProduct: SQLiteStatement,
}

export type Product = {
    id: number;
    name: string;
    price: number;
    active: boolean
}

export default class ProductRepository {
    private readonly queries: Queries;
    constructor(queries: Queries) {
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<ProductRepository> {
        try {
            await db.execAsync(INIT_PRODUCT_TBL);
        } catch (reason) {
            const message = `${REPO}: ${reason}`;
            if (__DEV__) console.error(message);
            throw new Error(message);
        }

        const [init, productByName, productByActivity, editProduct, addProduct] = await Promise.all([
            compileSQL(db, INIT_PRODUCT_TBL),
            compileSQL(db, GET_PRODUCT_BY_NAME),
            compileSQL(db, GET_PRODUCT_BY_ACTIVITY),
            compileSQL(db, EDIT_PRODUCT),
            compileSQL(db, ADD_PRODUCT),
        ]);

        const queries: Queries = {
            init,
            productByName,
            productByActivity,
            editProduct,
            addProduct,
        }

        return new ProductRepository(queries);
    }
    async getProductByName(name: string): Promise<Product | null> {
        const product = await this.queries.productByName.executeAsync<Product>(name)
            .then(result => result.getFirstAsync())
            .catch(reason => { 
                throw new Error(`getProductByName: ${reason}`) 
            });

        if (__DEV__) console.log(JSON.stringify(product));

        return product;
    }
    async getProductByActivity(active: boolean): Promise<Product[]> {
        const value = active ? 1 : 0;

        const products = await this.queries.productByActivity.executeAsync<Product>(value)
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getProductByActivity: ${reason}`)
            });

        if (__DEV__) console.log(JSON.stringify(products));

        return products;
    }
    async getActiveProducts(): Promise<Product[]> {
        const products = await this.getProductByActivity(true);
        return products;
    }
    async getInactiveProducts(): Promise<Product[]> {
        const products = await this.getProductByActivity(false);
        return products;
    }
    async editProduct(product: Product): Promise<void> {
        try {
            const result = await this.queries.editProduct.executeAsync(
                product.price,
                product.active,
                product.name,
                product.id,
            );

            if (__DEV__) console.log(`${REPO} changes: ${result.changes}`);
            if (result.changes === 0) throw new Error(`editProduct: ${product.id} was not updated`);
        
        } catch (reason) {
            throw new Error(`editProduct: ${reason}`);
        }
    }
    async addProduct(product: Product): Promise<void> {
        try {
            const result = await this.queries.addProduct.executeAsync(
                product.price,
                product.active,
                product.name,
            );

            if (__DEV__) console.log(`${REPO} changes: ${result.changes}`);
            if (result.changes === 0) throw new Error(`editProduct: ${product.id} was not updated`);
        
        } catch (reason) {
            throw new Error(`editProduct: ${reason}`);
        }
    }
}