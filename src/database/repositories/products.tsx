import { SQLiteDatabase } from "expo-sqlite";
const TRUE = 1;
const FALSE = 0;

export type Product = {
    id: number;
    name: string;
    price: number;
    active: boolean
}

export default class ProductRepository {
    private readonly db: SQLiteDatabase;
    private readonly repo: string;
    constructor(db: SQLiteDatabase) {
        this.db = db;
        this.repo = "products"
    }
    async getProductByName(name: string): Promise<Product | null> {
        const product = await this.db.getFirstAsync<Product>(`
            SELECT * FROM ${this.repo}
            WHERE name = ?`,
            name
        ).catch(reason => {
            console.log(`getProductByName: ${reason}`);
        });;

        return product ?? null;
    }
    async getProductByActivity(active: boolean): Promise<void | Product[]> {
        const value = active ? 1 : 0;
        return await this.db.getAllAsync<Product>(`
            SELECT * FROM ${this.repo}
            WHERE active = ?
            ORDER BY name`,
            value
        ).catch(reason => {
            console.log(`getProductByActivity: ${reason}`);
        });
    }
    async getActiveProducts(): Promise<Product[] | null> {
        const products = await this.getProductByActivity(true);
        return products ?? null;
    }
    async getInactiveProducts(): Promise<Product[] | null> {
        const products = await this.getProductByActivity(false);
        return products ?? null;
    }
}