import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "products";

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

type ProductRepositoryQueries = {
    productByName: SQLiteStatement,
    productByActivity: SQLiteStatement,
    editProduct: SQLiteStatement,
}

export type Product = {
    id: number;
    name: string;
    price: number;
    active: boolean
}

export default class ProductRepository {
    private readonly db: SQLiteDatabase;
    private readonly queries: ProductRepositoryQueries;
    constructor(db: SQLiteDatabase, queries: ProductRepositoryQueries) {
        this.db = db;
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<ProductRepository> {
        const [productByName, productByActivity, editProduct] = await Promise.all([
            compileSQL(db, GET_PRODUCT_BY_NAME),
            compileSQL(db, GET_PRODUCT_BY_ACTIVITY),
            compileSQL(db, EDIT_PRODUCT),
        ]);

        const queries: ProductRepositoryQueries = {
            productByName,
            productByActivity,
            editProduct,
        }

        return new ProductRepository(db, queries);
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
}