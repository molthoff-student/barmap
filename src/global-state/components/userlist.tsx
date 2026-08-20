import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGlobals } from "../provider";

export default function UserList() {
    const { userList, selectedUsers, toggleUser } = useGlobals();
    return (
        <View style={styles.namePanel}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.nameList}
            >
                {userList.map(user => {
                    const selected = selectedUsers.has(user.id);

                    return (
                        <Pressable
                            key={user.username}
                            onPress={() => toggleUser(user.id)}
                            style={[
                                styles.nameRow,
                                selected && styles.selectedNameRow,
                            ]}
                        >
                            <Text style={styles.nameText}>
                                {user.username}
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

    namePanel: {
        width: LEFT_PANEL_WIDTH,
        height: "100%",
        borderRightWidth: 3,
        borderRightColor: LINE_COLOR,
    },

    nameList: {
        paddingTop: 10,
        paddingBottom: 20,
    },

    nameRow: {
        height: 43,
        margin: 2,
        borderRadius: 15,
        justifyContent: 'center',
        // paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: LINE_COLOR,
    },

    selectedNameRow: {
        backgroundColor: HIGHLIGHT_COLOR,
    },

    nameText: {
        fontSize: 14,
        color: LINE_COLOR,
        alignSelf: 'center'
    },
});