import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "factions";

const INIT_FACTIONS_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${REPO} (
        faction TEXT PRIMARY KEY
    );
`;

const GET_ALL_FACTIONS: string = `
    SELECT * FROM ${REPO}
`

const ADD_FACTION: string = `
    INSERT INTO ${REPO} (
        faction
    ) VALUES (
        ?
    );
`;

type Queries = {
    allFactions: SQLiteStatement,
    addFaction: SQLiteStatement,
}

export type Faction = {
    faction: string,
};

export default class FactionRepository {
    private readonly queries: Queries;

    constructor(queries: Queries) {
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<FactionRepository> {
        try {
            await db.execAsync(INIT_FACTIONS_TBL);
        } catch (reason) {
            const message = `${REPO}: ${reason}`;
            if (__DEV__) console.error(message);
            throw new Error(message);
        }

        const [allFactions, addFaction] = await Promise.all([
            compileSQL(db, GET_ALL_FACTIONS),
            compileSQL(db, ADD_FACTION),
        ]);

        const queries: Queries = {
            allFactions,
            addFaction,
        }

        return new FactionRepository(queries);
    }
    async getAllFactions(): Promise<string[] | null> {
        const factions = await this.queries.allFactions.executeAsync<Faction>()
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getAllFactions: ${reason}`) 
            });

        return factions.map(faction => faction.faction);
    }
    async addFaction(faction: string): Promise<void> {
        try {
            const result = await this.queries.addFaction.executeAsync(
                faction
            );

            if (__DEV__) console.log(`${REPO} changes: ${result.changes}`);
            if (result.changes === 0) throw new Error(`editProduct: ${faction} was not updated`);
        
        } catch (reason) {
            throw new Error(`editProduct: ${reason}`);
        }
    }
}