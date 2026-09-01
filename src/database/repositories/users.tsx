import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";

const REPO: string = "users";

const INIT_USER_TBL: string = `
    CREATE TABLE IF NOT EXISTS ${REPO} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        given_money INTEGER NOT NULL DEFAULT 0,
        spent_money INTEGER NOT NULL DEFAULT 0,
        faction TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0
            CHECK (active IN (0, 1)),

        FOREIGN KEY (faction)
            REFERENCES factions(faction)
    );
`;

const GET_USER_BY_NAME: string = `
    SELECT * FROM ${REPO}
    WHERE username = ?
`;

const GET_USER_BY_FACTION: string = `
    SELECT * FROM ${REPO}
    WHERE faction = ?
    ORDER BY username
`;

const GET_ALL_USERS: string = `
    SELECT * FROM ${REPO}
    ORDER BY username
`;

const EDIT_USER = `
    UPDATE ${REPO}
    SET
        username = ?,
        given_money = ?,
        spent_money = ?,
        faction = ?
    WHERE id = ?;
`;

const ADD_USER = `
    INSERT INTO ${REPO} (
        username,
        given_money,
        spent_money,
        faction
    ) VALUES (
        ?,
        ?,
        ?,
        ?
    );
`;

type Queries = {
    userByName: SQLiteStatement,
    userByFaction: SQLiteStatement,
    allUsers: SQLiteStatement,
    editUser: SQLiteStatement,
    addUser: SQLiteStatement,
}

type SQLUser = {
    id: number;
    username: string;
    given_money: number;
    spent_money: number;
    faction: string;
};

const sqlToJS = (user: SQLUser | null): User | null => {
    if (!user) return null;
    return {
        id: user.id, 
        username: user.username, 
        given_money: new Currency(user.given_money), 
        spent_money: new Currency(user.spent_money),
        balance: new Currency(user.given_money - user.spent_money),
        faction: user.faction
    };
}

export type User = {
    id: number;
    username: string;
    given_money: Currency;
    spent_money: Currency;
    balance: Currency;
    faction: string;
};

export default class UserRepository {
    private readonly queries: Queries;
    constructor(
        queries: Queries
    ) {
        this.queries = queries;
    }

    static async create(db: SQLiteDatabase): Promise<UserRepository> {
        try {
            await db.execAsync(INIT_USER_TBL);
        } catch (reason) {
            const message = `${REPO}: ${reason}`;
            if (__DEV__) console.error(message);
            throw new Error(message);        }

        const [userByName, userByFaction, allUsers, editUser, addUser] = await Promise.all([
            compileSQL(db, GET_USER_BY_NAME),
            compileSQL(db, GET_USER_BY_FACTION),
            compileSQL(db, GET_ALL_USERS),
            compileSQL(db, EDIT_USER),
            compileSQL(db, ADD_USER),
        ]);

        const queries: Queries = {
            userByName,
            userByFaction,
            allUsers,
            editUser,
            addUser
        }

        return new UserRepository(queries);
    }

    async getUserByName(name: string): Promise<User | null> {
        const user = await this.queries.userByName.executeAsync<SQLUser>(name)
            .then(result => result.getFirstAsync())
            .catch(reason => { 
                throw new Error(`getUserByName: ${reason}`) 
            });

        if (__DEV__) console.log(JSON.stringify(user));
        
        return sqlToJS(user);
    }
    async getUsersByFaction(faction: string): Promise<User[] | null> {
        const users = await this.queries.userByFaction.executeAsync<SQLUser>(faction)
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getUsersByFaction: ${reason}`) 
            });

        return users.map(user => sqlToJS(user)!);
    }
    async getAllUsers(): Promise<User[] | null> {
        const users = await this.queries.allUsers.executeAsync<SQLUser>()
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getAllUsers: ${reason}`) 
            });

        return users.map(user => sqlToJS(user)!);
    }

    async editUser(user: User): Promise<void> {
        try {
            console.log("updating user:", JSON.stringify(user));

            const result = await this.queries.editUser.executeAsync(
                user.username,
                user.given_money.value,
                user.spent_money.value,
                user.faction,
                user.id,
            );

            console.log("users changes:", result.changes);

            if (result.changes === 0) {
                throw new Error(`User ${user.id} was not updated`);
            }
        } catch (reason) {
            throw new Error(`editUser: ${reason}`);
        }
    }
    async addUser(user: User): Promise<void> {
        try {
            console.log("updating user:", JSON.stringify(user));

            const result = await this.queries.addUser.executeAsync(
                user.username,
                user.given_money.value,
                user.spent_money.value,
                user.faction,
            );

            console.log("users changes:", result.changes);

            if (result.changes === 0) {
                throw new Error(`User ${user.id} was not updated`);
            }
        } catch (reason) {
            throw new Error(`editUser: ${reason}`);
        }
    }
}