import { File, Paths } from "expo-file-system";
import * as LegacyFileSystem from "expo-file-system/legacy"; // SAF lives only in the legacy module
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import * as XLSX from "xlsx";
import Database from "../database/interface";
import {
    FACTIONS,
    USERS,
    PRODUCTS,
    CREDIT,
    TRANSACTIONS,
} from "../database/db-init";
import { SQLUser } from "../database/repositories/users";
import { SQLFaction } from "../database/repositories/factions";
import { SQLCredit } from "../database/repositories/credits";
import { SQLProduct } from "../database/repositories/products";
import { SQLTransaction } from "../database/repositories/transactions";

async function pickJsonFile() {
    const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
    });

    if (result.canceled) {
        return null;
    }

    const file = new File(result.assets[0].uri);
    const contents = await file.text();

    return JSON.parse(contents);
}

function convertDbName(dbname: string): string {
    switch (dbname) {
        case FACTIONS:
            return "Speltakken";
        case USERS:
            return "Gebruikers";
        case PRODUCTS:
            return "Producten";
        case CREDIT:
            return "Krediet";
        case TRANSACTIONS:
            return "Transacties";
        default:
            return dbname;
    }
}

function convertDbRows(
    dbname: string,
    dbrows: Record<string, any>[],
): Record<string, any>[] {
    switch (dbname) {
        case FACTIONS:
            return (dbrows as SQLFaction[]).map((value) => ({
                ["ID"]: value.id,
                ["Naam"]: value.name,
                ["Actief"]: value.active === 1,
            }));
        case USERS:
            return (dbrows as SQLUser[]).map((value) => ({
                ["ID"]: value.id,
                ["Naam"]: value.name,
                ["Inleg"]: value.given_money * 0.01,
                ["Uitgave"]: value.spent_money * 0.01,
                ["Balans"]: (value.given_money - value.spent_money) * 0.01,
                ["Speltak"]: value.faction,
                ["Actief"]: value.active === 1,
            }));
        case PRODUCTS:
            return (dbrows as SQLProduct[]).map((value) => ({
                ["ID"]: value.id,
                ["Naam"]: value.name,
                ["Prijs"]: value.price * 0.01,
                ["Actief"]: value.active === 1,
            }));
        case CREDIT:
            return (dbrows as SQLCredit[]).map((value) => ({
                ["ID"]: value.id,
                ["Gebruiker ID"]: value.user_id,
                ["Inleg"]: value.given_money * 0.01,
                ["Datum"]: value.created_at,
            }));
        case TRANSACTIONS:
            return (dbrows as SQLTransaction[]).map((value) => ({
                ["ID"]: value.id,
                ["Gebruiker ID"]: value.user_id,
                ["Product ID"]: value.product_id,
                ["Aantal"]: value.amount_bought,
                ["Kosten"]: value.amount_spent * 0.01,
                ["Datum"]: value.created_at,
            }));
        default:
            return dbrows;
    }
}

async function buildWorkbookBase64(db: Database): Promise<string> {
    const tableNames = await db.inner
        .getAllAsync<{ name: string }>(
            `SELECT name FROM sqlite_master WHERE type = "table" AND name NOT LIKE "sqlite_%"`,
        )
        .then((tables) => tables.map((row) => row.name))
        .catch((reason) => {
            throw new Error(`buildWorkbookBase64: ${reason.message}`);
        });

    const tables: Record<string, Record<string, any>[]> = {};
    for (const dbname of tableNames) {
        const name = convertDbName(dbname);
        const dbRows = await db.inner.getAllAsync<Record<string, any>>(
            `SELECT * FROM "${dbname}"`,
        );
        const rows = convertDbRows(dbname, dbRows);
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

const { StorageAccessFramework } = LegacyFileSystem;
const androidOsMimeType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export async function exportDatabaseToExcel(db: Database): Promise<void> {
    const base64 = await buildWorkbookBase64(db);
    const fileName = `export_${Date.now()}.xlsx`;

    if (Platform.OS === "android") {
        await saveViaFolderPicker(base64, fileName, androidOsMimeType);
    } else {
        await saveViaShareSheet(base64, fileName);
    }
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
