import {
    GestureResponderEvent,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import { Overlay } from "../global-state/components/overlay";
import statics, { color, border, fonts } from "@/src/static";
import { useDatabase } from "../database/provider";
import { useEffect, useState } from "react";
import UserRepository, { User } from "../database/repositories/users";
import Loading from "../loading";
import Currency from "../currency";
import { exportDatabaseToExcel } from "./excel-export";
import TransactionRepository from "../database/repositories/transactions";

type RecordListEntry = {
    title?: string;
    stats: string[][];
};

function computeUserTotals(userList: User[]) {
    return userList.reduce(
        (acc, u) => {
            if (u.given_money.value > acc.given_money.given_money.value) {
                acc.given_money = u;
            }
            if (u.spent_money.value > acc.spent_money.spent_money.value) {
                acc.spent_money = u;
            }
            acc.totalGiven = acc.totalGiven.add(u.given_money);
            acc.totalSpent = acc.totalSpent.add(u.spent_money);
            return acc;
        },
        {
            given_money: userList[0],
            spent_money: userList[0],
            totalGiven: new Currency(),
            totalSpent: new Currency(),
        },
    );
}

async function loadStatistics(
    users: UserRepository,
    transactions: TransactionRepository,
    setStatistics: React.Dispatch<
        React.SetStateAction<RecordListEntry[][] | null>
    >,
) {
    const userList = await users.getAllUsers();
    if (!userList) return setStatistics(null);

    const { given_money, spent_money, totalGiven, totalSpent } =
        computeUserTotals(userList);

    const mostBoughtList = await transactions.getMostBoughtByUsers();
    const buyerSorted = mostBoughtList
        .filter((value) => value !== undefined)
        .sort((a, b) => b.total_spent.value - a.total_spent.value);

    const balanceSorted = [...userList].sort(
        (a, b) => b.balance.value - a.balance.value,
    );

    const balance = balanceSorted[0];
    const len = Math.max(balance.toString().length - 2, 2);

    const balanceLeaderboard = balanceSorted
        // .slice(0, 5)
        .map((value) => [
            value.name,
            value.faction,
            value.balance.toString(len),
        ]);

    const buyerLeaderboard = buyerSorted.map((value) => [
        value.user_name,
        `${value.total_bought}x ${value.product_name}`,
        value.total_spent.toString(len),
    ]);

    const statistics: RecordListEntry[][] = [
        [
            {
                stats: [
                    [
                        "Meeste ingelegd",
                        given_money.name,
                        given_money.given_money.toString(len),
                    ],
                    [
                        "Meeste uitgegeven",
                        spent_money.name,
                        spent_money.spent_money.toString(len),
                    ],
                    [
                        "Hoogste balans",
                        balance.name,
                        balance.balance.toString(len),
                    ],
                ],
            },
            {
                stats: [
                    ["Totaal ingelegd", totalGiven.toString(len)],
                    ["Totaal uitgegeven", totalSpent.toString(len)],
                    ["Aantal gebruikers", userList.length.toString(10)],
                ],
            },
        ],
        [
            { title: "Hoogste balansen", stats: balanceLeaderboard },
            { title: "Grootste kopers", stats: buyerLeaderboard },
        ],
    ];

    setStatistics(statistics);
}

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

function ExportButton() {
    const { database } = useDatabase();
    return (
        <Pressable
            style={styles.exportButton}
            onPress={() => exportDatabaseToExcel(database.inner)}
        >
            <Text style={styles.exportButtonText}>Exporteer</Text>
        </Pressable>
    );
}

function DisplayStat({
    text,
    style,
}: {
    text: string[];
    style?: StyleProp<ViewStyle>;
}) {
    const last = text.length - 1;
    return (
        <View style={[styles.row, style]}>
            {text.map((value, index) => {
                const align = index < last ? "left" : "right";
                return (
                    <Text
                        key={index}
                        style={[styles.rowText, { textAlign: align }]}
                    >
                        {value}
                    </Text>
                );
            })}
        </View>
    );
}

function RecordList({ title, stats }: RecordListEntry) {
    const last = stats.length - 1;
    return (
        <View style={styles.column}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
            <View style={styles.listBlock}>
                {stats.map((text, index) => {
                    return (
                        <DisplayStat
                            key={index}
                            style={index < last && styles.seperator}
                            text={text}
                        />
                    );
                })}
            </View>
        </View>
    );
}

export function Records({ exit }: { exit?: () => void }) {
    const { users, transactions } = useDatabase();
    const [statistics, setStatistics] = useState<RecordListEntry[][] | null>(
        null,
    );

    useEffect(() => {
        loadStatistics(users, transactions, setStatistics);
    }, [users, transactions, setStatistics]);

    if (!statistics)
        return <Loading message="Statistieken worden geladen..." />;

    return (
        <Overlay noViewStyle={true}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Burger onPress={exit} />
                    <Text style={styles.title}>{"Statistieken"}</Text>
                    <ExportButton />
                </View>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {statistics.map((pair, index) => {
                        return (
                            <View
                                key={"pair" + index}
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                {pair.map((entry, index) => (
                                    <RecordList
                                        key={"entry" + index}
                                        title={entry.title}
                                        stats={entry.stats}
                                    />
                                ))}
                            </View>
                        );
                    })}
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
        backgroundColor: color.primary,
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
        color: color.primary,
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
        color: color.primary,
        borderBottomColor: color.primary,
        borderBottomWidth: statics.width.section,
        height: TAB_HEIGHT,
        lineHeight: TAB_HEIGHT - statics.width.section,
        paddingLeft: 12,
        letterSpacing: 0.5,
    },
    sectionTitle: {
        marginTop: 8,
        marginBottom: 4,
        // textTransform: "uppercase",
        letterSpacing: 0.5,
        ...fonts.bold,
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
    // statGrid: {
    //     flexDirection: "row",
    //     flexWrap: "wrap",
    // },
    // cardRow: {
    //     flexDirection: "row",
    //     width: "50%",
    //     padding: 8,
    //     gap: 10,
    // },
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
    },
    rowText: {
        flex: 1,
        ...fonts.bold,
    },
    seperator: {
        borderBottomColor: color.primary,
        borderBottomWidth: statics.width.default,
    },
});
