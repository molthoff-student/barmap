import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy'; // SAF lives only in the legacy module
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Platform } from 'react-native';

const { StorageAccessFramework } = LegacyFileSystem;

export async function exportDatabaseToExcel(db: SQLite.SQLiteDatabase): Promise<void> {
  const base64 = await buildWorkbookBase64(db);
  const fileName = `export_${Date.now()}.xlsx`;
  const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (Platform.OS === 'android') {
    await saveViaFolderPicker(base64, fileName, mimeType);
  } else {
    await saveViaShareSheet(base64, fileName);
  }
}

async function buildWorkbookBase64(db: SQLite.SQLiteDatabase): Promise<string> {
    const tableNames = await db.getAllAsync<{ name: string }>(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
    ).then(tables => tables.map(row => row.name))
    .catch(reason => {
        throw new Error(`buildWorkbookBase64: ${reason}`);
    });

    const tables: Record<string, Record<string, any>[]> = {};
    for (const name of tableNames) {
        tables[name] = await db.getAllAsync<Record<string, any>>(`SELECT * FROM "${name}"`);
    }

    const workbook = XLSX.utils.book_new();
    const usedSheetNames = new Set<string>();

    for (const [tableName, rows] of Object.entries(tables)) {
        let sheetName = tableName.slice(0, 31).replace(/[\\/?*[\]]/g, '_');
        let suffix = 1;

        while (usedSheetNames.has(sheetName)) {
            const base = tableName.slice(0, 31 - String(suffix).length - 1);
            sheetName = `${base}_${suffix++}`;
        }

        usedSheetNames.add(sheetName);

        const worksheet = rows.length > 0
            ? XLSX.utils.json_to_sheet(rows)
            : XLSX.utils.json_to_sheet([{}]);

        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    return XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' }) as string;
}

async function saveViaFolderPicker(base64: string, fileName: string, mimeType: string): Promise<void> {
    const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (!permissions.granted) {
        throw new Error('exportDatabaseToExcel: user did not grant folder access.');
    }

    const fileUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        mimeType
    );

    await LegacyFileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: LegacyFileSystem.EncodingType.Base64,
    });
}

async function saveViaShareSheet(base64: string, fileName: string): Promise<void> {
    const file = new File(Paths.cache, fileName);
    file.create();
    file.write(base64, { encoding: 'base64' });

    if (!(await Sharing.isAvailableAsync())) {
        throw new Error('exportDatabaseToExcel: sharing is not available on this device.');
    }

    await Sharing.shareAsync(file.uri, {
        UTI: 'public.item',
        dialogTitle: 'Save database export',
    });
}