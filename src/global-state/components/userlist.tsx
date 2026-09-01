import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useUsers } from "../provider";
import React, { useCallback, useMemo, useState } from "react";
import { getUserIconDestination } from "../../administration/icons";
import defaultIcon from "./../../../assets/default-user-icon.png";
import { EditUser } from "./overlay";
import statics from "@/src/static";
import { User } from "@/src/database/repositories/users";

const COLUMNS = 4;
const GAP = 1.5;
const CARD_WIDTH = 100 / COLUMNS - GAP;

const DefaultIcon = React.memo(function DefaultIcon() {
    return (
        <Image
            source={defaultIcon}
            style={styles.image}
            alt={`default user icon`}
        />
    );
});

const UserIcon = React.memo(function UserIcon({ id }: { id: number }) {
    const [loaded, setLoaded] = useState(false);
    const userIcon = { uri: getUserIconDestination(id) };

    if (__DEV__ && loaded) console.log(`UserIcon[${id}] loaded succesfully`);

    return (
        <>
            {loaded
                ? <Image
                    source={userIcon}
                    style={styles.image}
                    alt={`icon ${id}`}
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(false)}
                />
                : <DefaultIcon />
            }
        </>
    );
});

const UserCard = React.memo(function UserCard({ item, selected, len, toggleUser, setEditUser }: { 
    item: User,
    selected: boolean,
    len: number,
    toggleUser: (id: number) => void,
    setEditUser: (value: React.SetStateAction<User | null>) => void,
}) {
        return (
            <Pressable
                onPress={() => toggleUser(item.id)}
                onLongPress={() => setEditUser(item)}
                delayLongPress={500}
                style={[
                    styles.card,
                    selected && styles.selectedCard,
                ]}
            >
                <UserIcon id={item.id} />
                <View style={styles.userDescription}>
                    <Text style={styles.text}>
                        {item.username.slice(0, 16)}
                    </Text>
                    <Text style={styles.text}>
                        {item.balance.toString(len)}
                    </Text>
                </View>
            </Pressable>
        );
    }
);

export default function UserList() {
    const { userList, selectedUsers, toggleUser } = useUsers();
    const [editUser, setEditUser] = useState<User | null>(null);

    const len = useMemo(
        () => {
            const highest = userList.reduce(
                (highest, item) => Math.max(highest, item.balance.value),
                0
            );

            const len = Math.max(highest.toString().length - 2, 2);

            if (__DEV__) console.log(`highest balance: €${(highest / 100).toFixed(2)}`);
            if (__DEV__) console.log(`len: ${len}`);

            return len;
        },
        [userList]
    );

    if (__DEV__) {
        const list: string[] = [...selectedUsers.entries()].map(user => {
            return userList.find(value => value.id == user[0])!.username;
        });

        console.log(`Selected users: ${JSON.stringify(list)}`);
    }

    const renderItem = useCallback(({ item }: { item: User }) => (
        <UserCard
            item={item}
            selected={selectedUsers.has(item.id)}
            len={len}
            toggleUser={toggleUser}
            setEditUser={setEditUser}
        />
    ), [selectedUsers, len, toggleUser]);

    return (
        <View style={styles.container}>
            <FlatList
                data={userList}
                numColumns={COLUMNS}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                style={{ height: '85%' }}
            />
            {editUser &&
                <EditUser
                    user={editUser}
                    exit={() => setEditUser(null)}
                />
            }
        </View>
    );
}

const { color, border } = statics;
const { width } = border;

const styles = StyleSheet.create({
    container: {
        width: `${(100 / 6) * COLUMNS}%`,
        height: '100%',
        borderRightWidth: width.section,
        borderRightColor: color.accent,
        borderLeftWidth: width.section,
        borderLeftColor: color.accent,
        flexDirection: 'column',
    },

    listContent: {
        paddingHorizontal: `${GAP / 2}%`,
        paddingVertical: `${GAP / 2}%`,
    },

    card: {
        aspectRatio: 1,
        width: `${CARD_WIDTH}%`,
        marginHorizontal: `${GAP / 2}%`,
        marginVertical: `${GAP / 2}%`,
        borderRadius: 15,
        borderWidth: width.default,
        borderColor: color.accent,
        alignItems: 'center',
        overflow: 'hidden',
    },

    image: {
        // width: '100%',
        // height: '100%',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        resizeMode: 'cover',
    },

    selectedCard: {
        borderColor: color.highlight,
        borderWidth: 4,
    },

    userDescription: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        // paddingVertical: 8,
        height: 60,
        backgroundColor: color.overlay,
        borderTopWidth: width.default,
        borderTopColor: color.accent,
    },

    text: {
        fontSize: 18,
        color: color.accent,
        fontFamily: "monospace",
        fontWeight: 'bold',
    },
});