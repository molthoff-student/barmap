import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useGlobals } from "../provider";
import { useMemo, useState } from "react";
import Currency from "../../currency";
import { getUserIconDestination } from "../../administration/icons";
import defaultIcon from "./../../../assets/default-user-icon.png";
import { EditUser, UserTag } from "./overlay";
import { ACCENT_COLOR, DEFAULT_BORDER_WIDTH, HIGHLIGHT_COLOR, OVERLAY_COLOR, SECTION_BORDER_WIDTH } from "@/src/static";
import { User } from "@/src/database/repositories/users";

function UserIcon({ id }: { id: number }) {
    const [error, setError] = useState(false);
    const userIcon = getUserIconDestination(id);
    const source = error ? defaultIcon : { uri: userIcon };
    
    if (__DEV__) {
        const fileName = error ? defaultIcon : userIcon;
        console.log(`userIcon[${id}]: ${fileName}`);
    }

    return (
        <Image
            source={source}
            style={styles.image}
            alt={`icon ${id}`}
            onError={(event) => {
                if (__DEV__) console.log(`image load error: ${event.nativeEvent.error}`);
                setError(true);
            }}
        />
    );
}

export default function UserList() {
    const { userList, selectedUsers, toggleUser } = useGlobals();
    const [editUser, setEditUser] = useState<User | null>(null);

    const { users, len } = useMemo(
        () => {
            let highestBalance = -Infinity;
            const users: UserTag[] = userList.map(user => {
                const balance = new Currency(user.given_money - user.spent_money);

                if (highestBalance < balance.value) {
                    highestBalance = balance.value;
                }

                return {
                    id: user.id,
                    name: user.username,
                    balance: balance,
                };
            });

            const len = Math.max(highestBalance.toString().length - 2, 2);

            if (__DEV__) console.log(`highest balance: €${(highestBalance / 100).toFixed(2)}`);
            if (__DEV__) console.log(`len: ${len}`);

            return { users, len };
        },
        [userList]
    );

    if (__DEV__) {
        const list: string[] = [...selectedUsers.entries()].map(user => {
            return userList.find(value => value.id == user[0])!.username;
        });

        console.log(list);
    }

    const renderItem = ({ item }: { item: UserTag }) => {

        const selected = selectedUsers.has(item.id);

        return (
            <>
                <Pressable
                    onPress={() => toggleUser(item.id)}
                    onLongPress={() => {
                        const user = userList.find(user => user.id == item.id);
                        if (user) setEditUser(user);
                    }}
                    delayLongPress={500}
                    style={[
                        styles.card,
                        selected && styles.selectedCard,
                    ]}
                >
                    <UserIcon id={item.id} />
                    <View style={styles.userDescription}>
                        <Text style={styles.text}>
                            {item.name}
                        </Text>
                        <Text style={styles.text}>
                            {item.balance.toString(len)}
                        </Text>
                    </View>
                </Pressable>
            </>
        );
    }

    return (
        <View 
            style={styles.container}
        >
            <FlatList
                data={users}
                numColumns={COLUMNS}
                keyExtractor={item => item.id.toString()}
                columnWrapperStyle={styles.row}
                renderItem={renderItem}
                style={{ height: '85%' }}
            />
            {editUser &&
                <EditUser
                    user={editUser}
                    exit={() => setEditUser(null)} 
                />
            }
            <View style={styles.config}>

            </View>
        </View>
    );
}

const PANEL_WIDTH = 862;
const PADDING = 10;
const GAP = 10;
const COLUMNS = 4;

const INNER_WIDTH = PANEL_WIDTH -
    2 * SECTION_BORDER_WIDTH -
    2 * PADDING;

const CARD_SIZE =
    (INNER_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS;

if (__DEV__) {
    console.log(`PANEL_WIDTH: ${PANEL_WIDTH}`);
    console.log(`CARD_SIZE: ${CARD_SIZE}`);
}

const styles = StyleSheet.create({
    container: {
        width: PANEL_WIDTH,
        height: '100%',
        borderRightWidth: SECTION_BORDER_WIDTH,
        borderRightColor: ACCENT_COLOR,
        borderLeftWidth: SECTION_BORDER_WIDTH,
        borderLeftColor: ACCENT_COLOR,
        flexDirection: 'column',
    },

    row: {
        width: '100%',
        paddingHorizontal: PADDING,
        paddingTop: PADDING,
        justifyContent: 'space-between',
    },

    card: {
        height: CARD_SIZE,
        width: CARD_SIZE,
        borderRadius: 15,
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderColor: ACCENT_COLOR,
        // justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    selectedCard: {
        borderColor: HIGHLIGHT_COLOR,
        borderWidth: 8,
    },

    userDescription: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingVertical: 8,
        backgroundColor: OVERLAY_COLOR,
    },

    text: {
        fontSize: 18,
        color: ACCENT_COLOR,
        // alignSelf: 'center',
        fontWeight: 'bold',
    },

    config: {
        marginTop: 8,
        borderTopWidth: SECTION_BORDER_WIDTH,
        borderBottomWidth: SECTION_BORDER_WIDTH,
        borderColor: ACCENT_COLOR,
        height: '15%',
        flex: 1,
        flexDirection: 'row',
    },

    button: {
        // height: 48,
        height: '100%',
        minWidth: 140,
        // paddingHorizontal: 20,

        borderRadius: 12,
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderColor: ACCENT_COLOR,
        backgroundColor: OVERLAY_COLOR,

        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: '1%',
        marginLeft: '1%',

    },

    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ACCENT_COLOR,
    },
});