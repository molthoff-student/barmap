import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { useFactions } from '../provider';
import { exportDatabaseToExcel } from '@/src/administration/excel-export';
import { useDatabase } from '@/src/database/provider';
import statics from '@/src/static';
import { useCallback, useState } from 'react';

const Statistics = 

export default function Tabbar() {
    const { database } = useDatabase();
    const { factionList, factionIdx, setFactionIdx } = useFactions();
    const [overlay, setOverlay] = useState(false);
    const exit = useCallback(() => setOverlay(false), []);

    return (
        <View style={styles.tabsContainer}>
            <Pressable 
                style={styles.menuButton}
                onPress={() => exportDatabaseToExcel(database.inner)}
            >
                {/* Who needs image assets lmao */}
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
const { color, border } = statics;
const { width } = border;

const styles = StyleSheet.create({
    tabsContainer: {
        height: TAB_HEIGHT,
        flexDirection: 'row',
        borderBottomWidth: 3,
        borderBottomColor: color.accent,
        backgroundColor: color.default,
    },

    menuButton: {
        width: 40,
        height: TAB_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: width.section,
        borderColor: color.accent,
    },

    menuLine: {
        width: 27,
        height: 3,
        backgroundColor: color.accent,
        marginVertical: 2,
    },

    tabs: {
        flexGrow: 1,
        flexDirection: 'row',
    },

    tab: {
        width: 170,
        height: TAB_HEIGHT,
        backgroundColor: color.lowlight,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
        borderWidth: width.default,
        borderColor: color.accent,
    },

    firstTab: {
        marginLeft: 2,
    },

    selectedTab: {
        backgroundColor: color.highlight,
    },

    tabText: {
        fontFamily: "monospace",
        fontWeight: '700',
        fontSize: 18,
        color: color.accent,
    },
});