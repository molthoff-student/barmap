import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";
import Currency from "@/src/currency";
import { USERS as REPO } from "../db-init";
if (__DEV__) console.log("USERS / REPO =", REPO);

const replacer = (_: string, value: unknown) =>
    value instanceof Currency ? value.toString() : value;

const GET_USER_BY_NAME: string = `
    SELECT * FROM ${REPO}
    WHERE name = ?
`;

const GET_USER_BY_FACTION: string = `
    SELECT * FROM ${REPO}
    WHERE faction = ?
    ORDER BY name
`;

const GET_ALL_USERS: string = `
    SELECT * FROM ${REPO}
    ORDER BY name
`;

const EDIT_USER = `
    UPDATE ${REPO}
    SET
        name = ?,
        given_money = given_money
            + MAX(0, ? - (given_money - spent_money)),
        spent_money = spent_money
            + MAX(0, (given_money - spent_money) - ?),
        faction = ?,
        active = ?
    WHERE id = ?;
`;

const ADD_USER = `
    INSERT INTO ${REPO} (
        name,
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
    userByName: SQLiteStatement;
    userByFaction: SQLiteStatement;
    allUsers: SQLiteStatement;
    editUser: SQLiteStatement;
    addUser: SQLiteStatement;
};

export type SQLUser = {
    id: number;
    name: string;
    given_money: number;
    spent_money: number;
    faction: string;
    active: number;
};

export type User = {
    id: number;
    name: string;
    given_money: Currency;
    spent_money: Currency;
    balance: Currency;
    faction: string;
    active: boolean;
};

export const sqlToUser = (user: SQLUser | null): User | null => {
    if (!user) return null;
    return {
        id: user.id,
        name: user.name,
        given_money: new Currency(user.given_money),
        spent_money: new Currency(user.spent_money),
        balance: new Currency(user.given_money - user.spent_money),
        faction: user.faction,
        active: user.active === 1,
    };
};

export default class UserRepository {
    private readonly queries: Queries;
    constructor(queries: Queries) {
        this.queries = queries;
    }

    static create = async (db: SQLiteDatabase): Promise<UserRepository> => {
        const [userByName, userByFaction, allUsers, editUser, addUser] =
            await Promise.all([
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
            addUser,
        };

        return new UserRepository(queries);
    };

    getUserByName = async (name: string): Promise<User | null> => {
        const user = await this.queries.userByName
            .executeAsync<SQLUser>(name)
            .then((result) => result.getFirstAsync())
            .catch((reason) => {
                throw new Error(`getUserByName: ${reason.message}`);
            });

        if (__DEV__)
            console.log(`getUserByName: ${JSON.stringify(user, replacer)}`);

        return sqlToUser(user);
    };
    getUsersByFaction = async (faction: string): Promise<User[] | null> => {
        const users = await this.queries.userByFaction
            .executeAsync<SQLUser>(faction)
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getUsersByFaction: ${reason.message}`);
            });

        return users.map((user) => sqlToUser(user)!);
    };
    getAllUsers = async (): Promise<User[]> => {
        const users = await this.queries.allUsers
            .executeAsync<SQLUser>()
            .then((result) => result.getAllAsync())
            .catch((reason) => {
                throw new Error(`getAllUsers: ${reason.message}`);
            });

        return users.map((user) => sqlToUser(user)!);
    };

    editUser = async (user: User): Promise<number> => {
        if (__DEV__)
            console.log(`editing user: ${JSON.stringify(user, replacer, 4)}`);

        const isExist = await this.getUserByName(user.name);
        if (isExist && isExist.id !== user.id)
            throw new Error("Gebruiker met deze naam bestaat al");

        if (__DEV__) console.log(`isExist: ${isExist}`);
        const id = await this.queries.editUser
            .executeAsync<SQLUser>(
                user.name.trimEnd(),
                user.balance.value,
                user.balance.value,
                user.faction,
                user.active,
                user.id,
            )
            .then((res) => {
                if (__DEV__) console.log(`res: ${JSON.stringify(res)}`);
                return res.changes === 0 ? null : user.id;
            });

        if (id) return id;
        throw new Error(`User ${user.name} was not updated`);
    };
    addUser = async (user: User): Promise<number> => {
        if (__DEV__)
            console.log("adding user:", JSON.stringify(user, replacer));

        const isExist = await this.getUserByName(user.name);
        if (isExist) throw new Error(`Gebruiker ${user.name} bestaat al`);

        const id = await this.queries.addUser
            .executeAsync<SQLUser>(
                user.name.trimEnd(),
                user.given_money.value,
                user.spent_money.value,
                user.faction,
            )
            .then((res) => {
                return res.changes === 0 ? null : res.lastInsertRowId;
            });

        if (id) return id;
        throw new Error(`User ${user.name} was not updated`);
    };
}
