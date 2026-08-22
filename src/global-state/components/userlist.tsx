import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGlobals } from "../provider";
import { useMemo } from "react";
import Currency from "../../currency";

type UserTag = {
    id: number,
    name: string,
    balance: Currency
}

export default function UserList() {
    const { userList, selectedUsers, toggleUser } = useGlobals();

    const users: UserTag[] = useMemo(
        () => {
            return userList.map(user => {
                const balance = new Currency(user.given_money - user.spent_money);
                return {
                    id: user.id,
                    name: user.username,
                    balance: balance,
                };
            });
        }, 
        [userList]
    );

    return (
        <View style={styles.panel}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
            >
                {users.map(user => {
                    const selected = selectedUsers.has(user.id);

                    return (
                        <Pressable
                            key={user.id}
                            onPress={() => toggleUser(user.id)}
                            style={[
                                styles.row,
                                selected && styles.selectedRow,
                            ]}
                        >
                            <Text style={styles.text}>
                                {user.name}
                            </Text>
                            <Text>
                                {user.balance.toString()}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const LEFT_PANEL_WIDTH = 210;
const LINE_COLOR = '#000000';
const BACKGROUND_COLOR = '#FFFFFF';
const HIGHLIGHT_COLOR = '#91C5F2';
const LOWLIGHT_COLOR = '#d3d3d3';

const styles = StyleSheet.create({

    panel: {
        width: LEFT_PANEL_WIDTH,
        height: "100%",
        borderRightWidth: 3,
        borderRightColor: LINE_COLOR,
    },

    list: {
        paddingTop: 10,
        paddingBottom: 20,
    },

    row: {
        height: 43,
        margin: 2,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: LINE_COLOR,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '5%',
        paddingRight: '5%',
    },

    selectedRow: {
        backgroundColor: HIGHLIGHT_COLOR,
    },

    text: {
        fontSize: 14,
        color: LINE_COLOR,
        alignSelf: 'center'
    },
});