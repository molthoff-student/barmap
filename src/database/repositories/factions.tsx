import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import { FACTIONS as REPO } from "../db-init";
if (__DEV__) console.log("FACTIONS / REPO =", REPO);

const GET_FACTIONS_BY_NAME: string = `
    SELECT * FROM ${REPO}
    WHERE name = ?
`;

const GET_FACTIONS_BY_ACTIVITY: string = `
    SELECT * FROM ${REPO}
    WHERE active = ?
`;

const GET_ALL_FACTIONS: string = `
    SELECT * FROM ${REPO}
`;

const EDIT_FACTION: string = `
    UPDATE ${REPO}
    SET
        name = ?,
        active = ?
    WHERE id = ?;
`;

const ADD_FACTION: string = `
    INSERT INTO ${REPO} (
        name,
        active
    ) VALUES (
        ?,
        ?
    );
`;

type Queries = {
    getAllFactions: SQLiteStatement;
    factionByActivity: SQLiteStatement;
    factionByName: SQLiteStatement;
    editFaction: SQLiteStatement;
    addFaction: SQLiteStatement;
};

type SQLFaction = {
    id: number;
    name: string;
    active: number;
};

export type Faction = {
    id: number;
    name: string;
    active: boolean;
};

function sqlToJs(sql: SQLFaction | null): Faction | null {
    if (!sql) return null;
    return {
        id: sql.id,
        name: sql.name,
        active: sql.active === 1,
    };
}

export default class FactionRepository {
    private readonly queries: Queries;

    constructor(queries: Queries) {
        this.queries = queries;
    }
    static async create(db: SQLiteDatabase): Promise<FactionRepository> {
        const [
            getAllFactions,
            factionByActivity,
            factionByName,
            editFaction,
            addFaction,
        ] = await Promise.all([
            compileSQL(db, GET_ALL_FACTIONS),
            compileSQL(db, GET_FACTIONS_BY_ACTIVITY),
            compileSQL(db, GET_FACTIONS_BY_NAME),
            compileSQL(db, EDIT_FACTION),
            compileSQL(db, ADD_FACTION),
        ]);

        const queries: Queries = {
            getAllFactions,
            factionByActivity,
            factionByName,
            editFaction,
            addFaction,
        };

        return new FactionRepository(queries);
    }
    getAllFactions = async (): Promise<Faction[] | null> => {
        const factions = await this.queries.getAllFactions
            .executeAsync<SQLFaction>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getAllFactions: ${reason.message}`);
            });

        return factions.map((faction) => sqlToJs(faction)!);
    };
    getFactionByName = async (name: string): Promise<Faction | null> => {
        const user = await this.queries.factionByName
            .executeAsync<SQLFaction>(name)
            .then((result) => result.getFirstAsync())
            .catch((reason) => {
                throw new Error(`getUserByName: ${reason.message}`);
            });

        return sqlToJs(user);
    };
    editFaction = async (faction: Faction): Promise<number> => {
        if (__DEV__) console.log(`editFaction: ${JSON.stringify(faction)}`);
        const isExist = await this.getFactionByName(faction.name);
        if (isExist && isExist.id !== faction.id)
            throw new Error("Speltak met deze naam bestaat al");

        if (__DEV__) console.log(`isExist: ${JSON.stringify(isExist)}`);

        const id = await this.queries.editFaction
            .executeAsync<SQLFaction>(
                faction.name.trimEnd(),
                faction.active ? 1 : 0,
                faction.id,
            )
            .then((res) => {
                if (__DEV__) console.log(`editFaction: ${JSON.stringify(res)}`);
                return res.changes === 0 ? null : faction.id;
            });

        if (__DEV__) console.log(`id: ${JSON.stringify(id)}`);
        if (id) return id;
        throw new Error(`Faction ${faction.name} was not updated`);
    };
    addFaction = async (faction: Faction): Promise<number> => {
        const isExist = await this.getFactionByName(faction.name);
        if (isExist) throw new Error(`Speltak '${faction.name}' bestaat al`);

        const id = await this.queries.addFaction
            .executeAsync<SQLFaction>(
                faction.name.trimEnd(),
                faction.active ? 1 : 0,
            )
            .then((res) => {
                return res.changes === 0 ? null : res.lastInsertRowId;
            });

        if (id) return id;
        throw new Error(`Faction ${faction.name} was not updated`);
    };
}
