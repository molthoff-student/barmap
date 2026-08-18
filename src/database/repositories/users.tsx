import { SQLiteDatabase } from "expo-sqlite";

export default class UserRepository {
    private readonly db: SQLiteDatabase
    constructor(db: SQLiteDatabase) {
        this.db = db;
    }
    getUserId(name: string): number | null {
        return null;
    }
}