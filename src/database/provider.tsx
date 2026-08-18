import React, { createContext, useContext, useEffect, useState } from 'react';
import DataBase from './interface';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

type DataBaseCtx = {
    db: DataBase,
    admin: boolean,
}

const DatabaseContext = createContext<DataBaseCtx | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const [db, setDb] = useState<DataBase | null>(null);
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        DataBase.create()
            .then(setDb)
            .catch((error) => {
                console.error('Failed to initialize database:', error);
            });
    }, []);

    if (!db) {
        const color = "#00bfff";
        return (<ActivityIndicator 
            size="large"  
            color={color} 
            style={styles.loading} 
        />);
    }

    return (
        <DatabaseContext.Provider value={{ db, admin }}>
            {children}
        </DatabaseContext.Provider>
    );
}

export function useDatabase() {
    const db = useContext(DatabaseContext);

    if (!db) {
        throw new Error('useDatabase must be used inside DatabaseProvider');
    }

    return db;
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});