import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useProducts, useUsers } from "../../provider";
import { useCallback, useMemo, useState } from "react";
import Currency from "@/src/currency";
import Loading from "@/src/loading";
import { AdminOverlay } from "../overlay";
import { User } from "@/src/database/repositories/users";
import {
    Button,
    createStyles,
    Seperator,
    styles as sharedStyles,
} from "./shared";
import { useDatabase } from "@/src/database/provider";
import { Transaction } from "@/src/database/repositories/transactions";
import statics, { border, color, fonts } from "@/src/static";

const LedgerHeader = () => (
    <View style={styles.listContent}>
        <View style={styles.listItem}>
            <Text style={styles.label}>{"Naam"}</Text>
            <Text style={styles.label}>{"Balans"}</Text>
            <Text style={styles.label}>{"Kosten"}</Text>
            <Text style={styles.label}>{"Na afschrijven"}</Text>
        </View>
    </View>
);

export function Ledger({ exit }: { exit: () => void }) {
    const { productList, sellingList } = useProducts();
    const { selectedUsers, userList, updateUsers } = useUsers();
    const { transactions } = useDatabase();

    const [loadRequest, setLoadRequest] = useState(false);

    const { total, filteredUsers, ledger } = useMemo(() => {
        let total = new Currency();

        const ledger: Transaction[] = productList.flatMap((value) => {
            const quantity = sellingList.get(value.id);
            if (quantity === undefined) return [];

            const price = value.price.mul(quantity);
            total = total.add(price);

            const transaction: Transaction = {
                id: 0,
                user_id: 0,
                product_id: value.id,
                amount_bought: quantity,
                amount_spent: price,
                created_at: new Date(),
            };

            return [transaction];
        });

        const filteredUsers = userList.filter((value) =>
            selectedUsers.has(value.id),
        );

        return { total, filteredUsers, ledger };
    }, [selectedUsers, userList]);

    const chargePayment = useCallback(async () => {
        setLoadRequest(true);
        try {
            for (const user of filteredUsers) {
                for (const item of ledger) {
                    const transaction: Transaction = {
                        ...item,
                        user_id: user.id,
                    };
                    await transactions.addTransaction(transaction);
                }
            }
        } catch (reason: any) {
            Alert.alert(`Failed to `);
        }
        updateUsers();
        setLoadRequest(false);
        exit();
    }, [filteredUsers, ledger]);

    const renderItem = ({ item }: { item: User }) => {
        return (
            <View style={styles.listItem}>
                <Text style={styles.label}>{item.name}</Text>
                <Text style={styles.label}>{item.balance.toString()}</Text>
                <Text style={styles.label}>{total.toString()}</Text>
                <Text style={styles.label}>
                    {item.balance.sub(total).toString()}
                </Text>
            </View>
        );
    };

    return loadRequest ? (
        <Loading message="loadRequest=true" />
    ) : (
        <AdminOverlay exit={exit}>
            <View style={styles.list}>
                <LedgerHeader />
                <FlatList
                    data={filteredUsers}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={1}
                    renderItem={renderItem}
                />
                <Seperator />
                <Button title="Schrijf producten af" onPress={chargePayment} />
            </View>
        </AdminOverlay>
    );
}

const overlayWidth = "70%";
const styles = StyleSheet.create({
    ...createStyles(overlayWidth),
    listContent: {
        alignItems: "center",
        width: "100%",
        // borderBottomColor: color.accent,
        // borderBottomWidth: statics.width.default,
    },
    listItem: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderBottomColor: color.primary,
        borderBottomWidth: statics.width.default,
    },
    label: {
        flex: 1,
        ...fonts.bold,
        // borderBottomColor: color.accent,
        // borderBottomWidth: statics.width.default,
        // ...border.default,
    },
});
