import {
    GestureResponderEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Overlay } from "../global-state/components/overlay";
import statics, { color, border, fonts } from "@/src/static";
import { useDatabase } from "../database/provider";
import { useEffect, useMemo, useState } from "react";
import { User } from "../database/repositories/users";
import Loading from "../loading";
import Currency from "../currency";
import { exportDatabaseToExcel } from "./excel-export";

type Records = {
    len: number;
    given_money: User;
    balance: User;
    spent_money: User;
    totalGiven: Currency;
    totalSpent: Currency;
    balanceLeaderboard: User[];
};

type UserStats = {
    name: string;
    product: string;
    total_bought: number;
    total_spent: Currency;
};

export function Burger({
    onPress,
}: {
    onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
}) {
    return (
        <Pressable style={styles.burgerButton} onPress={onPress}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
        </Pressable>
    );
}

function ExportButton({
    onPress,
}: {
    onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
}) {
    return (
        <Pressable style={styles.exportButton} onPress={onPress}>
            <Text style={styles.exportButtonText}>Exporteer</Text>
        </Pressable>
    );
}

function DisplayStat({
    label,
    additional,
    value,
}: {
    label: string;
    additional?: string;
    value: string;
}) {
    return (
        <View style={styles.row}>
            <Text style={[styles.rowText, styles.label]}>{label}</Text>

            <Text style={[styles.rowText, styles.additional]}>
                {additional ?? ""}
            </Text>

            <Text style={[styles.rowText, styles.value]}>{value}</Text>
        </View>
    );
}
export function Records({ exit }: { exit?: () => void }) {
    const { database, users, transactions } = useDatabase();
    const [userList, setUserList] = useState<User[] | null>(null);
    const [statsList, setStatsList] = useState<UserStats[] | null>(null);

    useEffect(() => {
        const loadData = async () => {
            const userList = await users.getAllUsers();
            if (userList) {
                if (__DEV__) console.log(`obtained user list`);
                setUserList(userList);
            } else {
                if (__DEV__) console.log(`failed to obtain user list`);
                setStatsList(null);
                setUserList(null);
                return;
            }
        };

        loadData();
    }, [users]);

    const records: Records | null = useMemo(() => {
        if (!userList) return null;
        if (userList.length === 0) return null;

        const given_money = [...userList].sort(
            (a, b) => b.given_money.value - a.given_money.value,
        )[0];
        const balance = [...userList].sort(
            (a, b) => b.balance.value - a.balance.value,
        )[0];
        const spent_money = [...userList].sort(
            (a, b) => b.spent_money.value - a.spent_money.value,
        )[0];
        const totalGiven = userList.reduce(
            (sum, u) => sum.add(u.given_money),
            new Currency(),
        );
        const totalSpent = userList.reduce(
            (sum, u) => sum.add(u.spent_money),
            new Currency(),
        );
        const balanceLeaderboard = [...userList]
            .sort((a, b) => b.balance.value - a.balance.value)
            .slice(0, 5);

        const records: Records = {
            len: Math.max(balance.toString().length - 2, 2),
            given_money,
            balance,
            spent_money,
            totalGiven,
            totalSpent,
            balanceLeaderboard,
        };

        return records;
    }, [userList]);

    useEffect(() => {
        const loadStats = async () => {
            if (!userList) return;
            const top: UserStats[] = [];
            for (const user of userList) {
                const stats = await transactions.getMostBoughtByUser(user.id);
                if (!stats) continue;

                const entry: UserStats = {
                    name: user.name,
                    product: stats.product_name,
                    total_bought: stats.total_bought,
                    total_spent: stats.total_spent,
                };

                if (top.length < 5) {
                    let index = top.length - 1;
                    while (
                        index >= 0 &&
                        top[index].total_spent.value < entry.total_spent.value
                    ) {
                        index--;
                    }
                    top.splice(index + 1, 0, entry);
                } else if (entry.total_spent.value > top[4].total_spent.value) {
                    let index = 3;
                    while (
                        index >= 0 &&
                        top[index].total_spent.value < entry.total_spent.value
                    ) {
                        index--;
                    }
                    top.splice(index + 1, 0, entry);
                    top.pop();
                }
            }
            setStatsList(top);
        };

        loadStats();
    }, [userList]);

    const StatRows = useMemo(() => {
        if (!records || !userList) return [];

        const items: { label: string; additional?: string; value: string }[] = [
            {
                label: "Meeste ingelegd",
                additional: records.given_money.name,
                value: records.given_money.given_money.toString(),
            },
            {
                label: "Totaal binnengekregen",
                value: records.totalGiven.toString(),
            },
            {
                label: "Meeste gespendeert",
                additional: records.spent_money.name,
                value: records.spent_money.spent_money.toString(),
            },
            {
                label: "Totaal gespendeert",
                value: records.totalSpent.toString(),
            },
            {
                label: "Hoogste balans",
                additional: records.balance.name,
                value: records.balance.balance.toString(),
            },
            {
                label: "Aantal gebruikers",
                value: userList.length.toString(),
            },
        ];

        const rows: (typeof items)[] = [];
        for (let i = 0; i < items.length; i += 2) {
            rows.push(items.slice(i, i + 2));
        }
        return rows;
    }, [records, userList]);

    const BalanceRecord = useMemo(
        () =>
            records ? (
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Hoogste balansen</Text>
                    <View style={styles.listBlock}>
                        {records.balanceLeaderboard.map((user, index) => (
                            <DisplayStat
                                key={index}
                                label={user.name}
                                additional={user.faction}
                                value={user.balance.toString(records.len)}
                            />
                        ))}
                    </View>
                </View>
            ) : (
                <></>
            ),
        [records?.balanceLeaderboard],
    );

    const BuyerRecords = useMemo(
        () =>
            statsList && records ? (
                <View style={styles.column}>
                    <Text style={styles.sectionTitle}>Grootste kopers</Text>
                    <View style={styles.listBlock}>
                        {statsList.map((stats, index) => {
                            const spent = stats.total_spent.toString(
                                records.len,
                            );
                            return (
                                <DisplayStat
                                    key={index}
                                    label={stats.name}
                                    additional={stats.product}
                                    value={`${stats.total_bought} stuks voor ${spent}`}
                                />
                            );
                        })}
                    </View>
                </View>
            ) : (
                <></>
            ),
        [statsList, records?.len],
    );

    if (!userList) return <Loading message="Loading users..." />;
    if (!records) return <Loading message="Calculating records..." />;
    if (!statsList) return <Loading message="Fetching transactions..." />;

    return (
        <Overlay noViewStyle={true}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Burger onPress={exit} />
                    <Text style={styles.title}>Statistieken</Text>
                    {/* <Button
                        title="Exporteer"
                        color={color.accent}
                        onPress={() => exportDatabaseToExcel(database.inner)}
                    /> */}
                    <ExportButton
                        onPress={() => exportDatabaseToExcel(database.inner)}
                    />
                </View>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {StatRows.map((row, rowIndex) => (
                        <View key={rowIndex} style={styles.cardRow}>
                            {row.map((item, itemIndex) => (
                                <DisplayStat
                                    key={itemIndex}
                                    label={item.label}
                                    additional={item.additional}
                                    value={item.value}
                                />
                            ))}
                        </View>
                    ))}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        {BalanceRecord}
                        {BuyerRecords}
                    </View>
                </ScrollView>
            </View>
        </Overlay>
    );
}

export const TAB_HEIGHT = 40;

const styles = StyleSheet.create({
    content: {
        width: "100%",
        alignSelf: "stretch",
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    burgerButton: {
        width: 40,
        height: TAB_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        ...border.section,
    },
    burgerLine: {
        width: 27,
        height: 3,
        backgroundColor: color.accent,
        marginVertical: 2,
    },
    exportButton: {
        height: TAB_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 14,
        backgroundColor: "transparent",
        ...border.section,
    },
    exportButtonText: {
        fontFamily: "monospace",
        fontSize: 13,
        fontWeight: "700",
        color: color.accent,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    header: {
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "flex-start",
        width: "100%",
    },
    title: {
        flex: 1,
        fontFamily: "monospace",
        fontSize: 20,
        fontWeight: "700",
        color: color.accent,
        borderBottomColor: color.accent,
        borderBottomWidth: statics.width.section,
        height: TAB_HEIGHT,
        lineHeight: TAB_HEIGHT - statics.width.section,
        paddingLeft: 12,
        letterSpacing: 0.5,
    },
    scroll: {
        flex: 1,
        width: "100%",
        borderTopWidth: 0,
        paddingTop: 8,
        ...border.default,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 12,
    },
    column: {
        flex: 1,
        marginHorizontal: 4,
    },
    cardRow: {
        flexDirection: "row",
        gap: 10,
    },
    card: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "flex-start",
        gap: 4,
        ...border.default,
    },
    cardLabel: {
        color: color.accent,
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...fonts.bold,
    },
    cardValueRow: {
        flexDirection: "row",
        alignItems: "baseline",
        flexWrap: "wrap",
        columnGap: 6,
    },
    cardValue: {
        color: color.accent,
        textAlign: "right",
        ...fonts.bold,
    },
    cardSubtitle: {
        color: color.accent,
        opacity: 0.6,
        ...fonts.bold,
    },
    sectionTitle: {
        color: color.accent,
        marginTop: 8,
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        ...fonts.bold,
    },
    listBlock: {
        borderRadius: 10,
        overflow: "hidden",
        ...border.default,
    },
    row: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 8,
        gap: 6,
        ...border.default,
    },
    rowText: {
        color: color.accent,
        letterSpacing: -0.2,
        ...fonts.bold,
    },

    label: {
        flex: 16,
        textAlign: "left",
    },

    additional: {
        flex: 10,
        textAlign: "left",
    },

    value: {
        flex: 22,
        textAlign: "right",
    },
});
