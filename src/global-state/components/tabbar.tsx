import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";

import { useFactions } from "../provider";
import statics from "@/src/static";
import { Burger, TAB_HEIGHT } from "@/src/administration/records";
import { useMemo } from "react";

const { color, border, width } = statics;

export default function Tabbar({ open }: { open?: () => void }) {
    const { factionList, factionIdx, setFactionIdx } = useFactions();
    const factions = useMemo(() => {
        return factionList.filter((faction) => faction.active);
    }, [factionList]);
    return (
        <>
            <View style={styles.tabsContainer}>
                <Burger onPress={open} />
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabs}
                >
                    {factions.map((faction, index) => {
                        const selected = index === factionIdx;
                        return (
                            <Pressable
                                key={index}
                                onPress={() => setFactionIdx(index)}
                                style={[
                                    styles.tab,
                                    selected && styles.selectedTab,
                                    index === 0 && styles.firstTab,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        selected && styles.selectedTabText,
                                    ]}
                                >
                                    {faction.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        height: TAB_HEIGHT,
        flexDirection: "row",
        borderBottomWidth: 3,
        borderBottomColor: color.primary,
        backgroundColor: color.default,
    },

    tabs: {
        flexGrow: 1,
        flexDirection: "row",
    },

    tab: {
        width: 170,
        height: TAB_HEIGHT,
        // backgroundColor: color.lowlight,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 2,
        borderWidth: width.default,
        borderColor: color.primary,
    },

    firstTab: {
        marginLeft: 2,
    },

    selectedTab: {
        backgroundColor: color.secondary,
        // borderColor: color.secondary,
    },

    selectedTabText: {
        color: color.accent,
    },

    tabText: {
        fontFamily: "monospace",
        fontWeight: "700",
        fontSize: 18,
        color: color.primary,
    },
});
