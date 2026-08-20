import { SQLiteDatabase } from "expo-sqlite";

export type User = {
    id: number;
    username: string;
    given_money: number;
    spent_money: number;
    faction: string;
};

export default class UserRepository {
    private readonly db: SQLiteDatabase;
    private readonly repo: string;

    constructor(db: SQLiteDatabase) {
        this.db = db;
        this.repo = "users"
    }
    async getUserByName(username: string): Promise<User | null> {
        const user = await this.db.getFirstAsync<User>(`
            SELECT * FROM ${this.repo}
            WHERE username = ?`,
            username
        ).catch(reason => {
            console.log(reason);
        });;

        console.log(JSON.stringify(user));

        return user ?? null;
    }
    async getUsersByFaction(faction: string): Promise<User[] | null> {
        const users = await this.db.getAllAsync<User>(`
            SELECT * FROM ${this.repo}
            WHERE faction = ?
            ORDER BY username`,
            faction
        ).catch(reason => {
            console.log(reason);
        });

        return users ?? null;
    }
    async getAllUsers(): Promise<User[] | null> {
        const users = await this.db.getAllAsync<User>(`
            SELECT * FROM ${this.repo}`
        ).catch(reason => {
            console.log(reason);
        });

        return users ?? null;
    }
}