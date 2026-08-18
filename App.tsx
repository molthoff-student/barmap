import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Currency from './src/currency';
import { DatabaseProvider } from './src/database/provider';

export default function App() {
    const test = new Currency({ integer: 1, decimal: 50 });
    
    return (
        <DatabaseProvider>
            <View style={styles.container}>
                <Text>{`test: ${test}`}</Text>
                <StatusBar style="auto" />
            </View>
        </DatabaseProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
