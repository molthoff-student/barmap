import { SQLiteDatabase } from "expo-sqlite";

export type Faction = {
    faction: string,
};

export default class FactionRepository {
    private readonly db: SQLiteDatabase;
    private readonly repo: string;

    constructor(db: SQLiteDatabase) {
        this.db = db;
        this.repo = "factions";
    }
    async getAllFactions(): Promise<string[] | null> {
        const users = await this.db.getAllAsync<Faction>(`
            SELECT * FROM ${this.repo}`,
        ).catch(reason => {
            console.log(`getAllFactions: ${reason}`);
        });

        if (!users) return null;

        return users.map(user => user.faction);
    }
}