import { createContext, useContext, useEffect, useState } from "react";
import { useDatabase } from "../database/provider";
import { User } from "../database/repositories/users";
import Loading from "../loading";
import { Product } from "../database/repositories/products";

type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

type GlobalsCtx = {
    factionList: string[],
    factionIdx: number,
    setFactionIdx: SetState<number>
    userList: User[],
    selectedUsers: Set<number>,
    toggleUser: (key: number) => void,
    productList: Product[],
    sellingList: Map<number, number>,
    sellProduct: (key: number, increase: boolean) => void,
    updateFactions: () => void,
    updateUsers: () => void,
    updateProducts: () => void,
}

const GlobalsContext = createContext<GlobalsCtx | null>(null);

export function GlobalsProvider({ children }: { children: React.ReactNode }) {

    const { factions, products, users } = useDatabase();

    const [factionList, setFactionList] = useState<string[] | null>(null);
    const [factionIdx, setFactionIdx] = useState(0);

    const [userList, setUserList] = useState<User[] | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

    const [productList, setProductList] = useState<Product[] | null>(null);
    const [sellingList, setSellingList] = useState<Map<number, number>>(new Map());

    const toggleUser = (key: number) => {
        setSelectedUsers(current => {
            const next = new Set(current);

            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }

            return next;
        });
    }

    const sellProduct = (key: number, increase: boolean) => {
        setSellingList(prev => {
            const next = new Map(prev);
            const current = next.get(key) ?? 0;
            const value = current + (increase ? 1 : -1);

            if (value <= 0) {
                next.delete(key);
            } else {
                next.set(key, value);
            }

            return next;
        });
    }

    const updateFactions = () => {
        if (__DEV__) console.log("updating factionList");
        factions.getAllFactions()
            .then(setFactionList)
            .catch(reason => { if (__DEV__) console.log(`factionList: ${reason}`) });
    }

    const updateUsers = () => {
        if (factionList) {
            if (__DEV__) console.log("updating userList");
            users.getUsersByFaction(factionList[factionIdx])
                .then(setUserList)
                .catch(reason => { if (__DEV__) console.log(`userList: ${reason}`) });

            setSelectedUsers(new Set());
        } else {
            if (__DEV__) console.log("factionList wasn't loaded yet...");
        } 
    }

    const updateProducts = () => {
        products.getActiveProducts()
            .then(setProductList)
            .catch(reason => { if (__DEV__) console.log(`productList: ${reason}`) });
    }

    useEffect(
        updateFactions, 
        [factions]
    );

    useEffect(
        updateUsers, 
        [factionList, factionIdx, users]
    );

    useEffect(
        updateProducts,
        []
    );

    const isLoading = !(factionList && userList && productList);
    if (isLoading) return (<Loading message={`Loading globals...\nfactionList: ${factionList !== null}\nuserList: ${userList !== null}`} />);
    

    const value: GlobalsCtx = {
        factionList,
        factionIdx,
        setFactionIdx,

        userList,
        selectedUsers,
        toggleUser,

        productList,
        sellingList,
        sellProduct,

        updateFactions,
        updateUsers,
        updateProducts,
    }

    return (
        <GlobalsContext.Provider value={value} >
            {children}
        </GlobalsContext.Provider>
    );
}

export function useGlobals() {
    const gb = useContext(GlobalsContext);

    if (!gb) {
        throw new Error('useGlobals must be used inside GlobalsProvider');
    }

    return gb;
}