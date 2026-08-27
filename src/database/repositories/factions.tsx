import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "factions";

const GET_ALL_FACTIONS: string = `
    SELECT * FROM ${REPO}
`

type FactionRepositoryQueries = {
    allFactions: SQLiteStatement,
}

export type Faction = {
    faction: string,
};

export default class FactionRepository {
    private readonly db: SQLiteDatabase;
    private readonly queries: FactionRepositoryQueries;

    constructor(db: SQLiteDatabase, queries: FactionRepositoryQueries) {
        this.db = db;
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<FactionRepository> {
        const [allFactions] = await Promise.all([
            compileSQL(db, GET_ALL_FACTIONS),
        ]);

        const queries: FactionRepositoryQueries = {
            allFactions,
        }

        return new FactionRepository(db, queries);
    }
    async getAllFactions(): Promise<string[] | null> {
        const factions = await this.queries.allFactions.executeAsync<Faction>()
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getAllFactions: ${reason}`) 
            });

        return factions.map(faction => faction.faction);
    }
}