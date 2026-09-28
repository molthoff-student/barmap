import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { DatabaseProvider } from "./src/database/provider";
import Tabbar from "./src/global-state/components/tabbar";
import { GlobalsProvider } from "./src/global-state/provider";
import UserList from "./src/global-state/components/userlist";
import Catalog from "./src/global-state/components/catalog";
import { Utilitybar } from "./src/global-state/components/utilitybar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Records } from "./src/administration/records";
import { color } from "./src/static";

function Window() {
    const [statistics, setStatistics] = useState(false);

    return (
        <>
            {statistics ? (
                <Records exit={() => setStatistics(false)} />
            ) : (
                <>
                    <Tabbar open={() => setStatistics(true)} />
                    <View style={styles.row}>
                        <UserList />
                        <Catalog />
                    </View>
                    <Utilitybar />
                </>
            )}
        </>
    );
}

export default function App() {
    if (__DEV__) console.log("Rendering App....");
    return (
        <DatabaseProvider>
            <GlobalsProvider>
                <SafeAreaView style={styles.container}>
                    <Window />
                    {__DEV__ && <StatusBar style="auto" />}
                </SafeAreaView>
            </GlobalsProvider>
        </DatabaseProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.default,
    },

    row: {
        flexDirection: "row",
    },
});
