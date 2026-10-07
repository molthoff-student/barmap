import {
    Alert,
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
import { exportDatabaseToExcel, importDatabaseFromExcel } from "./excel-export";
import TransactionRepository from "../database/repositories/transactions";
import Database from "../database/interface";
import { Seperator } from "../global-state/components/overlays/shared";
import { CREDIT, TRANSACTIONS } from "../database/db-init";

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

    const mostList = [
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
        ["Hoogste balans", balance.name, balance.balance.toString(len)],
    ];

    const totalList = [
        ["Totaal ingelegd", totalGiven.toString(len)],
        ["Totaal uitgegeven", totalSpent.toString(len)],
        ["Aantal gebruikers", userList.length.toString(10)],
    ];

    const statistics: RecordListEntry[][] = [
        [{ stats: mostList }, { stats: totalList }],
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

async function CleanDatabase(db: Database) {
    await db.wipeTable(CREDIT);
    await db.wipeTable(TRANSACTIONS);
}

type FooterButton = {
    label: string;
    onPress: () => void;
    important?: boolean;
};

function Footer() {
    const { database } = useDatabase();

    const FooterButtons: FooterButton[] = [
        { label: "Export", onPress: () => exportDatabaseToExcel(database) },
        {
            label: "Import",
            onPress: () => importDatabaseFromExcel(database),
            important: true,
        },
        {
            label: "Opschonen",
            onPress: () => console.log("Hello world!"),
            important: true,
        },
    ];

    return (
        <View style={[styles.pageShell, styles.footer]}>
            {FooterButtons.map((value, index) => (
                <Button
                    key={index}
                    label={value.label}
                    onPress={value.onPress}
                    important={value.important}
                />
            ))}
        </View>
    );
}

function ConfirmRequest(onPress?: () => void): () => void {
    return () =>
        Alert.alert(
            "",
            "Are you sure you want to continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Confirm",
                    onPress,
                },
            ],
            { cancelable: true },
        );
}

function Button({
    label,
    onPress,
    disabled = false,
    important = false,
}: {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
    important?: boolean;
}) {
    const click = important ? ConfirmRequest(onPress) : onPress;
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.6 },
                disabled && { opacity: 0.4 },
            ]}
            disabled={disabled}
            onPress={() => {
                if (__DEV__) console.log(`Clicked '${label}'`);
                if (click) click();
            }}
        >
            <Text style={styles.buttonText}>{label}</Text>
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
                <View style={[styles.pageShell, styles.header]}>
                    <Burger onPress={exit} />
                    <Text style={styles.title}>{"Statistieken"}</Text>
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
                    <Seperator />
                    <Footer />
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
    button: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        backgroundColor: color.overlay,
        alignItems: "center",
        justifyContent: "center",
        ...border.default,
    },
    buttonText: fonts.default,
    pageShell: {
        flexDirection: "row",
        alignItems: "stretch",
        width: "100%",
    },
    header: {
        justifyContent: "flex-start",
    },
    footer: {
        gap: 10,
        justifyContent: "space-between",
        paddingVertical: 5,
    },
    title: {
        flex: 1,
        borderBottomColor: color.primary,
        borderBottomWidth: statics.width.section,
        height: TAB_HEIGHT,
        lineHeight: TAB_HEIGHT - statics.width.section,
        paddingLeft: 12,
        letterSpacing: 0.5,
        ...fonts.bold,
    },
    sectionTitle: {
        marginTop: 8,
        marginBottom: 4,
        paddingHorizontal: 8,
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
        // paddingHorizontal: 16,
        paddingBottom: 32,
        gap: 12,
    },
    column: {
        flex: 1,
        marginHorizontal: 4,
    },
    listBlock: {
        borderRadius: 10,
        overflow: "hidden",
        marginHorizontal: 10,
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
