import { File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy"; // StorageAccessFramework lives only in the legacy module
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import * as XLSX from "xlsx";
import Database from "../database/interface";
import { serialize, deserialize, Row, DbTable } from "./serde";
import { FACTIONS, PRODUCTS, USERS } from "../database/db-init";
import { sqlToUser } from "../database/repositories/users";
import { sqlToFaction } from "../database/repositories/factions";
import { sqlToProduct } from "../database/repositories/products";

const { StorageAccessFramework } = LegacyFileSystem;

const ExcelMimeType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function importDatabaseFromExcel(database: Database) {
    const dbTable = await serializeExcelDocument();
    if (dbTable) await writeToDatabase(database, dbTable);
}

async function insertDbTable<SqlT, RegT>(
    rows: Row[],
    sqlToObj: (obj: SqlT) => RegT | null,
    addObj: (obj: RegT) => Promise<any>,
) {
    for (const sql of rows as SqlT[]) {
        const obj = sqlToObj(sql);
        if (__DEV__) console.log("inserting DbTable");
        if (obj) await addObj(obj);
    }
}

async function writeToDatabase(db: Database, dbTable: DbTable[]) {
    try {
        const tableNames = await db.tableNames();

        await db.inner.withTransactionAsync(async () => {
            for (const name of tableNames) {
                await db.wipeTable(name);
            }
        });

        for (const { name, rows } of dbTable) {
            if (__DEV__)
                console.log(`attempting to import '${name}' from Excel`);
            switch (name) {
                case FACTIONS:
                    await insertDbTable(
                        rows,
                        sqlToFaction,
                        db.factions.addFaction,
                    );
                    break;
                case USERS:
                    await insertDbTable(rows, sqlToUser, db.users.addUser);
                    break;
                case PRODUCTS:
                    await insertDbTable(
                        rows,
                        sqlToProduct,
                        db.products.addProduct,
                    );
                    break;
            }
        }
    } catch (reason: any) {
        Alert.alert("Kon niet alle data importeren:", reason.message);
    }
}

async function serializeExcelDocument() {
    const result = await DocumentPicker.getDocumentAsync({
        type: ExcelMimeType,
        copyToCacheDirectory: false,
    });

    if (result.canceled) {
        return null;
    }

    const file = result.assets[0];

    const base64 = await LegacyFileSystem.readAsStringAsync(file.uri, {
        encoding: LegacyFileSystem.EncodingType.Base64,
    });

    const workbook = XLSX.read(base64, {
        type: "base64",
    });

    const db = workbook.SheetNames.map((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Row>(sheet);
        return deserialize(sheetName, rows);
    });

    const rawData = JSON.stringify(db, undefined, 4);
    console.log(rawData);

    return db;
}

async function buildWorkbookBase64(db: Database): Promise<string> {
    const tableNames = await db.tableNames();

    const tables: Record<string, Record<string, any>[]> = {};
    for (const dbname of tableNames) {
        const dbRows = await db.inner.getAllAsync<Record<string, any>>(
            `SELECT * FROM "${dbname}"`,
        );
        const { name, rows } = serialize(dbname, dbRows);
        tables[name] = rows;
    }

    const workbook = XLSX.utils.book_new();
    const usedSheetNames = new Set<string>();

    for (const [tableName, rows] of Object.entries(tables)) {
        let sheetName = tableName.slice(0, 31).replace(/[\\/?*[\]]/g, "_");
        let suffix = 1;

        while (usedSheetNames.has(sheetName)) {
            const base = tableName.slice(0, 31 - String(suffix).length - 1);
            sheetName = `${base}_${suffix++}`;
        }

        usedSheetNames.add(sheetName);

        const worksheet =
            rows.length > 0
                ? XLSX.utils.json_to_sheet(rows)
                : XLSX.utils.json_to_sheet([{}]);

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    return XLSX.write(workbook, { type: "base64", bookType: "xlsx" }) as string;
}

async function saveViaFolderPicker(
    base64: string,
    fileName: string,
    mimeType: string,
): Promise<void> {
    const permissions =
        await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
        // throw new Error("exportDatabaseToExcel: user did not grant folder access.");
        return;
    }

    const fileUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        mimeType,
    );

    await LegacyFileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: LegacyFileSystem.EncodingType.Base64,
    });
}

async function saveViaShareSheet(
    base64: string,
    fileName: string,
): Promise<void> {
    const file = new File(Paths.cache, fileName);
    file.create();
    file.write(base64, { encoding: "base64" });

    const isShareAvailable = await Sharing.isAvailableAsync();
    if (!isShareAvailable) {
        throw new Error(
            "exportDatabaseToExcel: sharing is not available on this device.",
        );
    }

    await Sharing.shareAsync(file.uri, {
        UTI: "public.item",
        dialogTitle: "Save database export",
    });
}

export async function exportDatabaseToExcel(db: Database): Promise<void> {
    const base64 = await buildWorkbookBase64(db);
    const fileName = `export_${Date.now()}.xlsx`;

    if (Platform.OS === "android") {
        await saveViaFolderPicker(base64, fileName, ExcelMimeType);
    } else {
        await saveViaShareSheet(base64, fileName);
    }
}
