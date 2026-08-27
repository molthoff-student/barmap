import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";
import { compileSQL } from "../compile";

const REPO: string = "users";

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

type UserRepositoryQueries = {
    userByName: SQLiteStatement,
    userByFaction: SQLiteStatement,
    allUsers: SQLiteStatement,
    editUser: SQLiteStatement,
}

export type User = {
    id: number;
    username: string;
    given_money: number;
    spent_money: number;
    faction: string;
};

export default class UserRepository {
    private readonly db: SQLiteDatabase;
    private readonly queries: UserRepositoryQueries;
    constructor(
        db: SQLiteDatabase,
        queries: UserRepositoryQueries
    ) {
        this.db = db;
        this.queries = queries;
    }

    static async create(db: SQLiteDatabase): Promise<UserRepository> {
        const [userByName, userByFaction, allUsers, editUser] = await Promise.all([
            compileSQL(db, GET_USER_BY_NAME),
            compileSQL(db, GET_USER_BY_FACTION),
            compileSQL(db, GET_ALL_USERS),
            compileSQL(db, EDIT_USER),
        ]);

        const queries: UserRepositoryQueries = {
            userByName,
            userByFaction,
            allUsers,
            editUser
        }

        return new UserRepository(db, queries);
    }
    async getUserByName(username: string): Promise<User | null> {
        const user = await this.queries.userByName.executeAsync<User>(username)
            .then(result => result.getFirstAsync())
            .catch(reason => { 
                throw new Error(`getUserByName: ${reason}`) 
            });

        if (__DEV__) console.log(JSON.stringify(user));

        return user;
    }
    async getUsersByFaction(faction: string): Promise<User[] | null> {
        const users = await this.queries.userByFaction.executeAsync<User>(faction)
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getUsersByFaction: ${reason}`) 
            });

        return users;
    }
    async getAllUsers(): Promise<User[] | null> {
        const users = await this.queries.allUsers.executeAsync<User>()
            .then(result => result.getAllAsync())
            .catch(reason => { 
                throw new Error(`getAllUsers: ${reason}`) 
            });

        return users;
    }

    async editUser(user: User): Promise<void> {
        try {
            console.log("updating user:", JSON.stringify(user));

            const result = await this.queries.editUser.executeAsync(
                user.username,
                user.given_money,
                user.spent_money,
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
    // async createUser(user: User): Promise<void> {
    // 
    // }
}