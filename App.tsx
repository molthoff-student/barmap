import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { DatabaseProvider } from './src/database/provider';
import Tabbar from './src/global-state/components/tabbar';
import { GlobalsProvider } from './src/global-state/provider';
import UserList from './src/global-state/components/userlist';
import Catalog from './src/global-state/components/catalog';
import { Utilitybar } from './src/global-state/components/utilitybar';

export default function App() {
    if (__DEV__) console.log("Rendering App....");
    return (
        <DatabaseProvider>
            <GlobalsProvider>
                <View style={styles.container}>
                    <Tabbar />
                    <View style={styles.mainContent}>
                        <UserList />
                        <Catalog />
                    </View>
                    <Utilitybar />
                    {__DEV__ && <StatusBar style="auto" />}
                </View>
            </GlobalsProvider>
        </DatabaseProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        // marginTop: '3%',
        // marginBottom: '2%'
    },

    mainContent: {
        flexDirection: 'row',
    }
});
