import {
    FlatList,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";
import { AdminOverlay } from "../overlay";
import { User } from "@/src/database/repositories/users";
import { useCallback, useEffect, useMemo, useState } from "react";
import Currency from "@/src/currency";
import { useFactions, useUsers } from "../../provider";
import { useDatabase } from "@/src/database/provider";
import { selectUserIcon } from "@/src/administration/icons";
import {
    editObjCallback,
    IconPicker,
    ItemPicker,
    sanitizeText,
    Seperator,
    createStyles,
    styles as sharedStyles,
    tryDbStore,
    filterStr,
    ListHeader,
    EditCurrency,
    useSearchEngine,
    Button,
} from "./shared";
import Loading from "@/src/loading";

const Saving = () => <Loading message="Saving users..." />;
const Fetching = () => <Loading message="Fetching users..." />;

const defaultName = "Gebruikersnaam";
const defaultUser = (faction: string): User => {
    return {
        id: 0,
        name: defaultName,
        given_money: new Currency(),
        spent_money: new Currency(),
        balance: new Currency(),
        faction,
    };
};

function ConfigureUser({
    user,
    setUser,
    style,
    store,
}: {
    user: User;
    setUser: (user: User) => void;
    style?: StyleProp<ViewStyle>;
    store?: (user: User) => Promise<void | number>;
}) {
    const { factionList } = useFactions();
    const editUser = editObjCallback(user, setUser);

    const onChangeText = useCallback(
        (text: string) => {
            const newName = sanitizeText(text);
            if (newName !== null) editUser((next) => (next.name = newName));
        },
        [editUser],
    );

    const editBalance = useCallback(
        (balance: Currency) => {
            editUser((next) => (next.balance = balance));
            // editUser((next) => {
            //     const diff = balance.sub(next.balance);
            //     const more = diff.value > 0;
            //     if (more) {
            //         next.given_money = next.given_money.add(diff);
            //         next.balance = balance;
            //     }
            //     const less = diff.value < 0;
            //     if (less) {
            //         const addition = diff.mul(-1);
            //         next.spent_money = next.spent_money.add(addition);
            //         next.balance = balance;
            //     }
            //     if (__DEV__)
            //         console.log(`next: ${JSON.stringify(next, undefined, 4)}`);
            // });
        },
        [editUser],
    );

    const editFaction = useCallback(
        (name: string) => {
            const valid = factionList.find((faction) => faction.name === name);
            if (valid) editUser((next) => (next.faction = name));
        },
        [editUser],
    );

    const factions = useMemo(() => {
        return factionList.map((faction) => faction.name);
    }, [factionList]);

    return (
        <View style={[styles.popup, style]}>
            <IconPicker
                id={user.id}
                icon="user"
                onPress={() => selectUserIcon(user.id)}
            />
            <View style={{ flex: 1 }}>
                <View style={styles.editor}>
                    <Text style={styles.label}>{"Naam:"}</Text>
                    <TextInput
                        style={styles.input}
                        value={user.name}
                        onChangeText={onChangeText}
                        placeholder="Gebruikersnaam"
                    />
                </View>
                <EditCurrency
                    label="Balans:"
                    value={user.balance}
                    onChange={editBalance}
                />
                <ItemPicker
                    label="Speltak:"
                    valueList={factions}
                    selectedValue={user.faction}
                    onValueChange={(name) => editFaction(name)}
                />
                {store && <Button title="Bewaar" onPress={() => store(user)} />}
            </View>
        </View>
    );
}

export function EditUser({
    exit,
    user,
    setUser,
}: {
    exit: () => void;
    user: User;
    setUser: (user: User) => void;
}) {
    const { users } = useDatabase();
    const { updateUsers } = useUsers();
    const [loadRequest, setLoadRequest] = useState(false);

    const store = useCallback(
        tryDbStore(users.editUser, updateUsers, setLoadRequest, "product"),
        [users, setUser, updateUsers],
    );

    return loadRequest ? (
        <Saving />
    ) : (
        <AdminOverlay exit={exit}>
            <ConfigureUser
                store={store}
                user={user}
                setUser={setUser}
                style={styles.listItem}
            />
        </AdminOverlay>
    );
}

export function UserManager({ exit }: { exit: () => void }) {
    const { users } = useDatabase();
    const { updateUsers } = useUsers();
    const { factionList, factionIdx } = useFactions();
    const [loadRequest, setLoadRequest] = useState(false);
    const [allUsers, setAllUsers] = useState<User[] | null>(null);
    const getString = useCallback(
        (user: User) => filterStr(user.name),
        [filterStr],
    );
    const [filteredUsers, search, setSearch] = useSearchEngine(
        allUsers,
        getString,
    );

    const setUser = useCallback(
        (user: User) => {
            setAllUsers((current) => {
                if (!current) return current;
                return current.map((p) => (p.id === user.id ? user : p));
            });
        },
        [setAllUsers],
    );

    const storeAll = useCallback(
        tryDbStore(
            async (list: User[]) => {
                for (const user of list) {
                    await users.editUser(user);
                }
            },
            updateUsers,
            setLoadRequest,
            "product",
        ),
        [users, setUser, updateUsers],
    );

    const createNew = useCallback(
        tryDbStore(users.addUser, updateUsers, setLoadRequest, "product"),
        [users, setUser, updateUsers],
    );

    useEffect(() => {
        const loadUsers = async () => {
            const allUsers = await users.getAllUsers();
            setAllUsers(allUsers);
        };
        loadUsers();
    }, [users, loadRequest]);

    const renderItem = ({ item }: { item: User }) => {
        // console.log(`rendering user: ${item.name}`);
        return (
            <ConfigureUser
                user={item}
                setUser={setUser}
                style={styles.listItem}
            />
        );
    };

    return loadRequest ? (
        <Saving />
    ) : (
        <AdminOverlay exit={exit}>
            {allUsers ? (
                <View style={styles.list}>
                    <ListHeader
                        description="gebruiker"
                        search={search}
                        setSearch={setSearch}
                        createNew={() =>
                            createNew(defaultUser(factionList[factionIdx].name))
                        }
                    />
                    <Seperator />
                    <FlatList
                        data={filteredUsers}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={1}
                        renderItem={renderItem}
                    />
                    <Seperator />
                    <Button
                        title="Bewaar wijzigingen"
                        onPress={() => storeAll(allUsers)}
                    />
                </View>
            ) : (
                <Fetching />
            )}
        </AdminOverlay>
    );
}

const overlayWidth = "60%";
const styles = StyleSheet.create({
    ...createStyles(overlayWidth),
    ...sharedStyles,
});
