import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";
import { PRODUCTS as REPO } from "../db-init";
if (__DEV__) console.log("PRODUCTS / REPO =", REPO);

const GET_PRODUCT_BY_NAME: string = `
    SELECT * FROM ${REPO}
    WHERE name = ?
`;

const GET_ALL_PRODUCTS: string = `
    SELECT * FROM ${REPO}
    ORDER BY name
`;

const GET_PRODUCTS_BY_ACTIVITY: string = `
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
    productByName: SQLiteStatement;
    getAllProducts: SQLiteStatement;
    productByActivity: SQLiteStatement;
    editProduct: SQLiteStatement;
    addProduct: SQLiteStatement;
};

export type SQLProduct = {
    id: number;
    name: string;
    price: number;
    active: number;
};

export type Product = {
    id: number;
    name: string;
    price: Currency;
    active: boolean;
};

export function sqlToProduct(sql: SQLProduct | null): Product | null {
    if (!sql) return null;
    return {
        id: sql.id,
        name: sql.name,
        price: new Currency(sql.price),
        active: sql.active === 1,
    };
}

export default class ProductRepository {
    private readonly queries: Queries;
    constructor(queries: Queries) {
        this.queries = queries;
    }
    static create = async (db: SQLiteDatabase): Promise<ProductRepository> => {
        const [
            productByName,
            getAllProducts,
            productByActivity,
            editProduct,
            addProduct,
        ] = await Promise.all([
            compileSQL(db, GET_PRODUCT_BY_NAME),
            compileSQL(db, GET_ALL_PRODUCTS),
            compileSQL(db, GET_PRODUCTS_BY_ACTIVITY),
            compileSQL(db, EDIT_PRODUCT),
            compileSQL(db, ADD_PRODUCT),
        ]);

        const queries: Queries = {
            productByName,
            getAllProducts,
            productByActivity,
            editProduct,
            addProduct,
        };

        return new ProductRepository(queries);
    };
    getProductByName = async (name: string): Promise<Product | null> => {
        const product = await this.queries.productByName
            .executeAsync<SQLProduct>(name)
            .then((result) => result.getFirstAsync())
            .catch((reason) => {
                throw new Error(`getProductByName: ${reason.message}`);
            });

        if (__DEV__) console.log(JSON.stringify(product));

        return sqlToProduct(product);
    };

    getAllProducts = async (): Promise<Product[]> => {
        const products = await this.queries.getAllProducts
            .executeAsync<SQLProduct>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getProductByActivity: ${reason.message}`);
            });

        // if (__DEV__) console.log(JSON.stringify(products));

        return products.map((product) => sqlToProduct(product)!);
    };

    getProductByActivity = async (active: boolean): Promise<Product[]> => {
        const value = active ? 1 : 0;

        const products = await this.queries.productByActivity
            .executeAsync<SQLProduct>(value)
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getProductByActivity: ${reason.message}`);
            });

        if (__DEV__) console.log(JSON.stringify(products));

        return products.map((product) => sqlToProduct(product)!);
    };

    getActiveProducts = async (): Promise<Product[]> => {
        const products = await this.getProductByActivity(true);
        return products;
    };

    getInactiveProducts = async (): Promise<Product[]> => {
        const products = await this.getProductByActivity(false);
        return products;
    };

    editProduct = async (product: Product): Promise<number> => {
        const isExist = await this.getProductByName(product.name);

        if (isExist && isExist.id !== product.id)
            throw new Error(`Product met de naam "${product.name}" bestaat al`);

        const id = await this.queries.editProduct
            .executeAsync<SQLProduct>(
                product.price.value,
                product.active,
                product.name.trimEnd(),
                product.id,
            )
            .then((res) => {
                if (__DEV__) console.log(`editProduct: ${JSON.stringify(res)}`);

                return res.changes === 0 ? null : product.id;
            });

        if (__DEV__) console.log(`id: ${JSON.stringify(id)}`);

        if (id) return id;

        throw new Error(`Product ${product.name} was not updated`);
    };

    addProduct = async (product: Product): Promise<number> => {
        const isExist = await this.getProductByName(product.name);

        if (isExist)
            throw new Error(`Product met de naam "${product.name}" bestaat al`);

        const id = await this.queries.addProduct
            .executeAsync<SQLProduct>(
                product.price.value,
                product.active,
                product.name.trimEnd(),
            )
            .then((res) => {
                return res.changes === 0 ? null : res.lastInsertRowId;
            });

        if (id) return id;

        throw new Error(`Product ${product.name} is niet gecreëerd`);
    };
}
