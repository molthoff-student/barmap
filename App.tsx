import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { DatabaseProvider } from './src/database/provider';
import Tabbar from './src/global-state/components/tabbar';
import { GlobalsProvider } from './src/global-state/provider';
import UserList from './src/global-state/components/userlist';
import { log } from './src/logging';

export default function App() {
    log("Rendering App...");
    return (
        <DatabaseProvider>
            <GlobalsProvider>
                <View style={styles.container}>
                    <Tabbar />
                    <UserList />
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
        marginTop: '2%',
        marginBottom: '2%'
    },
});
