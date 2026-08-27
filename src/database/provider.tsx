import React, { createContext, useContext, useEffect, useState } from 'react';
import DataBase from './interface';
import UserRepository from './repositories/users';
import ProductRepository from './repositories/products';
import FactionRepository from './repositories/factions';
import Loading from '../loading';

type DatabaseCtx = {
    factions: FactionRepository,
    products: ProductRepository,
    users: UserRepository,
    admin: boolean,
    database: DataBase,
}

const DatabaseContext = createContext<DatabaseCtx | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
    const [db, setDb] = useState<DataBase | null>(null);
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        DataBase.create()
            .then(setDb)
            .catch((reason) => {
                if (__DEV__) console.error('Failed to initialize database:', reason);
            });
    }, []);

    if (!db) return (<Loading message="Loading database..." />);

    const value: DatabaseCtx = {
        database: db,
        factions: db.factions,
        products: db.products,
        users: db.users,
        admin: admin,
    }

    return (
        <DatabaseContext.Provider value={value}>
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