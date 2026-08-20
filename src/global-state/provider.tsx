import { createContext, useContext, useEffect, useState } from "react";
import { useDatabase } from "../database/provider";
import { User } from "../database/repositories/users";
import Loading from "../loading";
import { log } from "../logging";

type UseState<T> = React.Dispatch<React.SetStateAction<T>>;

type GlobalsCtx = {
    factionList: string[],
    factionIdx: number,
    setFactionIdx: UseState<number>
    userList: User[],
    selectedUsers: Set<number>,
    toggleUser: (id: number) => void,
}

const GlobalsContext = createContext<GlobalsCtx | null>(null);

export function GlobalsProvider({ children }: { children: React.ReactNode }) {

    const { factions, products, users } = useDatabase();

    const [factionList, setFactionList] = useState<string[] | null>(null);
    const [factionIdx, setFactionIdx] = useState(0);

    const [userList, setUserList] = useState<User[] | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

    const toggleUser = (id: number) => {
        setSelectedUsers(current => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    }

    useEffect(
        () => {
            console.log("updating factionList");
            factions.getAllFactions()
                .then(setFactionList)
                .catch(reason => log(`factionList: ${reason}`));
        }, 
        [factions]
    );

    useEffect(
        () => {
            if (factionList) {
                console.log("updating userList");
                users.getUsersByFaction(factionList[factionIdx])
                    .then(setUserList)
                    .catch(reason => console.log(`userList: ${reason}`));
            } else {
                console.log("factionList wasn't loaded yet...");
            }
        }, 
        [factionIdx, users]
    );

    const isLoading = !(factionList && userList);
    if (isLoading) return (<Loading message={`Loading globals...\nfactionList: ${factionList !== null}\nuserList: ${userList !== null}`} />);
    

    const value: GlobalsCtx = {
        factionList,
        factionIdx,
        setFactionIdx,
        userList,
        selectedUsers,
        toggleUser,
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