import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { useGlobals } from '../provider';

export default function Tabbar() {
    const { factionList, factionIdx, setFactionIdx } = useGlobals();

    return (
        <View style={styles.tabsContainer}>
            <Pressable style={styles.menuButton}>
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
                <View style={styles.menuLine} />
            </Pressable>
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabs}
            >   
                {factionList.map((faction, index) => {
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
                            <Text style={styles.tabText}>
                                {faction}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const TAB_HEIGHT = 40;
const LINE_COLOR = '#000000';
const BACKGROUND_COLOR = '#FFFFFF';
const HIGHLIGHT_COLOR = '#91C5F2';
const LOWLIGHT_COLOR = '#d3d3d3';

const styles = StyleSheet.create({
    tabsContainer: {
        height: TAB_HEIGHT,
        flexDirection: 'row',
        borderBottomWidth: 3,
        borderBottomColor: LINE_COLOR,
        backgroundColor: BACKGROUND_COLOR,
    },

    menuButton: {
        width: 40,
        height: TAB_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
            borderColor: LINE_COLOR,
    },

    menuLine: {
        width: 27,
        height: 3,
        backgroundColor: LINE_COLOR,
        marginVertical: 2,
    },

    tabs: {
        flexGrow: 1,
        flexDirection: 'row',
    },

    tab: {
        width: 170,
        height: TAB_HEIGHT,
        backgroundColor: LOWLIGHT_COLOR,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
        borderWidth: 1,
        borderColor: LINE_COLOR,
    },

    firstTab: {
        marginLeft: 2,
    },

    selectedTab: {
        backgroundColor: HIGHLIGHT_COLOR,
    },

    tabText: {
        fontSize: 14,
        color: LINE_COLOR,
    },
});