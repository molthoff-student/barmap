import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useDatabase } from "../database/provider";
import { User } from "../database/repositories/users";
import { Product } from "../database/repositories/products";
import Loading from "../loading";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type FactionCtx = {
    factionList: string[];
    factionIdx: number;
    setFactionIdx: SetState<number>;
    updateFactions: () => void;
};

type UsersCtx = {
    userList: User[];
    selectedUsers: Set<number>;
    toggleUser: (key: number) => void;
    updateUsers: () => void;
};

type ProductsCtx = {
    productList: Product[];
    sellingList: Map<number, number>;
    sellProduct: (key: number, increase: boolean, multiplier?: number) => void;
    updateProducts: () => void;
};

const FactionContext = createContext<FactionCtx | null>(null);
const UsersContext = createContext<UsersCtx | null>(null);
const ProductsContext = createContext<ProductsCtx | null>(null);

export function GlobalsProvider({ children }: { children: React.ReactNode }) {
    const { factions, products, users } = useDatabase();

    const [factionList, setFactionList] = useState<string[] | null>(null);
    const [factionIdx, setFactionIdx] = useState(0);

    const [userList, setUserList] = useState<User[] | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

    const [productList, setProductList] = useState<Product[] | null>(null);
    const [sellingList, setSellingList] = useState<Map<number, number>>(new Map());

    const toggleUser = useCallback((key: number) => {
        setSelectedUsers(current => {
            const next = new Set(current);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const sellProduct = useCallback((key: number, increase: boolean, multiplier = 1) => {
        const change = (increase ? 1 : -1) * (multiplier >= 1 ? multiplier : 1);
        setSellingList(prev => {
            const next = new Map(prev);
            const value = (next.get(key) ?? 0) + change;
            value <= 0 ? next.delete(key) : next.set(key, value);
            return next;
        });
    }, []);

    const updateFactions = useCallback(() => {
        if (__DEV__) console.log("updating factionList");
        factions.getAllFactions()
            .then(setFactionList)
            .catch(reason => { if (__DEV__) console.log(`factionList: ${reason}`) });
    }, [factions]);

    const updateUsers = useCallback(() => {
        if (!factionList) {
            if (__DEV__) console.log("factionList wasn't loaded yet...");
            return;
        }
        if (__DEV__) console.log("updating userList");
        users.getUsersByFaction(factionList[factionIdx])
            .then(setUserList)
            .catch(reason => { if (__DEV__) console.log(`userList: ${reason}`) });
        setSelectedUsers(new Set());
    }, [factionList, factionIdx, users]);

    const updateProducts = useCallback(() => {
        products.getActiveProducts()
            .then(setProductList)
            .catch(reason => { if (__DEV__) console.log(`productList: ${reason}`) });
    }, [products]);

    useEffect(updateFactions, [updateFactions]);
    useEffect(updateUsers, [updateUsers]);
    useEffect(updateProducts, [updateProducts]);

    const factionValue = useMemo<FactionCtx>(
        () => ({ factionList: factionList ?? [], factionIdx, setFactionIdx, updateFactions }),
        [factionList, factionIdx, updateFactions]
    );

    const usersValue = useMemo<UsersCtx>(
        () => ({ userList: userList ?? [], selectedUsers, toggleUser, updateUsers }),
        [userList, selectedUsers, toggleUser, updateUsers]
    );

    const productsValue = useMemo<ProductsCtx>(
        () => ({ productList: productList ?? [], sellingList, sellProduct, updateProducts }),
        [productList, sellingList, sellProduct, updateProducts]
    );

    const isLoading = !(factionList && userList && productList);

    if (isLoading) {
        const dbg = __DEV__ ? `\nfactionList: ${factionList !== null}\nuserList: ${userList !== null}\nproductList: ${productList !== null}` : '';
        return (
            <Loading message={'Loading globals...' + dbg} />
        );
    }

    return (
        <FactionContext.Provider value={factionValue}>
            <UsersContext.Provider value={usersValue}>
                <ProductsContext.Provider value={productsValue}>
                    {children}
                </ProductsContext.Provider>
            </UsersContext.Provider>
        </FactionContext.Provider>
    );
}

export function useFactions() {
    const ctx = useContext(FactionContext);
    if (!ctx) throw new Error('useFactions must be used inside GlobalsProvider');
    return ctx;
}

export function useUsers() {
    const ctx = useContext(UsersContext);
    if (!ctx) throw new Error('useUsers must be used inside GlobalsProvider');
    return ctx;
}

export function useProducts() {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error('useProducts must be used inside GlobalsProvider');
    return ctx;
}