import { SQLiteDatabase, SQLiteStatement } from "expo-sqlite";

export async function compileSQL(
    db: SQLiteDatabase,
    sql: string,
): Promise<SQLiteStatement> {
    return db.prepareAsync(sql)
        .catch(reason => { 
            throw new Error(reason) 
        });
}