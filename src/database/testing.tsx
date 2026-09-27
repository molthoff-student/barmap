import productJson from "@/test_data/products.json";
import wildevaart from "@/test_data/factions/wilde_vaart.json";
import leiding from "@/test_data/factions/leiding.json";
import stam from "@/test_data/factions/stam.json";
import ProductRepository, {
    Product,
    sqlToProduct,
} from "./repositories/products";
import UserRepository, { sqlToUser, User } from "./repositories/users";
import FactionRepository, { Faction } from "./repositories/factions";

const products: Product[] = productJson.map(
    (product) =>
        sqlToProduct({
            id: 0,
            ...product,
        })!,
);

const jsonDataArray = [wildevaart, leiding, stam];

const factions: Faction[] = jsonDataArray.map((item) => ({
    id: 0,
    name: item.faction,
    active: true,
}));
const users: User[] = jsonDataArray.flatMap((item) =>
    item.members.map(
        (user) =>
            sqlToUser({
                id: 0,
                faction: item.faction,
                ...user,
            })!,
    ),
);

async function tryInsert<T>(
    text: string,
    list: T[],
    callback: (item: T) => Promise<number>,
) {
    try {
        for (const item of list) {
            await callback(item);
        }
    } catch (reason: any) {
        throw new Error(
            `${text} test data: ${reason.message ?? "No reason given"}`,
        );
    }
}

async function insertProducts(repository: ProductRepository) {
    await tryInsert("product", products, repository.addProduct);
}

async function insertUsers(repository: UserRepository) {
    await tryInsert("user", users, repository.addUser);
}

async function insertFactions(repository: FactionRepository) {
    await tryInsert("faction", factions, repository.addFaction);
}

export async function insertTestData(
    factions: FactionRepository,
    users: UserRepository,
    products: ProductRepository,
) {
    await insertFactions(factions);
    await insertUsers(users);
    await insertProducts(products);
}
