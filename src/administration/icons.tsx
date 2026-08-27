import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths, RelocationOptions } from 'expo-file-system';

const USER_ICON_FOLDER_NAME: string = "user-icons";
function initUserIconDir(): Directory {
    const dir = new Directory(Paths.document, USER_ICON_FOLDER_NAME);
    if (!dir.exists) dir.create();
    if (__DEV__) console.log(`${USER_ICON_FOLDER_NAME} directory: ${dir.uri}`);
    return dir;
}

const USER_ICON_DIR = initUserIconDir();

export const getUserIconDestination = (id: number) => {
    return `${USER_ICON_DIR.uri}${id}.jpg`;
}

const PRODUCT_FOLDER_NAME: string = "product-icons";
function initProductIconDir(): Directory {
    const dir = new Directory(Paths.document, PRODUCT_FOLDER_NAME);
    if (!dir.exists) dir.create();
    if (__DEV__) console.log(`${PRODUCT_FOLDER_NAME} directory: ${dir.uri}`);
    return dir;
}

const PRODUCT_ICON_DIR = initProductIconDir();

export const getProductIconDestination = (id: number) => {
    return `${PRODUCT_ICON_DIR.uri}${id}.jpg`;
}

export async function selectImage(): Promise<File | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
    });

    if (result.canceled) {
        return null;
    }

    const asset = result.assets[0];
    const source = new File(asset.uri);

    return source;
}

export async function storeImage(path: string): Promise<void> {
    const source = await selectImage();

    if (!source) {
        return;
    }

    const destination = new File(path);
    const options: RelocationOptions = {
        overwrite: true,
    }

    await source.copy(destination, options)
        .catch(reason => {
            throw new Error(`copy image error: ${reason}`);
        });

    if (__DEV__) console.log(`succesfully uploaded image to '${destination.uri}'`);
}

export async function selectUserIcon(id: number): Promise<void> {
    const path = getUserIconDestination(id);
    await storeImage(path);
}

export async function selectProductIcon(id: number): Promise<void> {
    const path = getProductIconDestination(id);
    await storeImage(path);
}