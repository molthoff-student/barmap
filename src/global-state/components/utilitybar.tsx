import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useFactions, useProducts, useUsers } from "../provider";
import Currency from "../../currency";
import statics from "@/src/static";
import { COLUMNS } from "./userlist";
import { Overlay } from "./overlay";
import { User } from "@/src/database/repositories/users";

type UtilityButtonData = {
    label: string,
    component?: ReactNode,
}

const { color, border } = statics;
const { width } = border;

const LEFT_PANEL_PERCENT = (100 / 6) * COLUMNS;

function UtilityButton({ label, onPress }: {
    label: string,
    onPress?: () => void,
}) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
    );
}

const AddUser = React.memo(function AddUser({ exit }: { exit: () => void}) {
    const { factionList, factionIdx } = useFactions();
    const [user, setUser] = useState<User>({
        id: 0,
        username: "Gebruikersnaam",
        given_money: new Currency(),
        spent_money: new Currency(),
        balance: new Currency(),
        faction: factionList[factionIdx] || "FactionIdxException",
    });
    return (
        <Overlay exit={exit}>
            <View style={styles.popup}>
                <Text style={styles.totalText}>Hello world!</Text>
            </View>
        </Overlay>
    );
});

export function Utilitybar() {
    const { productList, sellingList } = useProducts();
    const [overlay, setOverlay] = useState<number | null>(null);

    const exit = useCallback(() => setOverlay(null), []);

    const UtilityButtonList: UtilityButtonData[] = [
        { label: "Voeg gebruiker toe", component: <AddUser exit={exit} /> },
        { label: "Voeg product toe", component: <Overlay exit={exit} /> },
        { label: "Schrijf producten af", component: <Overlay exit={exit} /> },
    ];

    const UtilityButtons = React.memo(function UtilityButtons() {
        return UtilityButtonList.map(({ label }, index) => (
            <UtilityButton key={index} label={label} onPress={() => setOverlay(index)} />
        ));
    })

    const total = useMemo(() => {
        let sum = 0;
        sellingList.forEach((quantity, id) => {
            const product = productList.find(p => p.id === id);
            if (product) sum += product.price * quantity;
        });
        return new Currency(sum);
    }, [sellingList, productList]);

    if (__DEV__) console.log(`overlay: ${overlay}`);

    return (
        <View style={styles.container}>
            <View style={styles.buttonGroup}>
                <UtilityButtons />
            </View>
            <View style={styles.totalBlock}>
                <Text style={styles.totalText}>Totaal: {total.toString()}</Text>
            </View>
            {typeof overlay === "number" && UtilityButtonList[overlay].component}
        </View>
    );
}

const styles = StyleSheet.create({
    popup: {
        width: "80%",
        padding: 20,
        borderRadius: 12,
        backgroundColor: color.default,
    },

    container: {
        flexDirection: 'row',
        width: '100%',
        height: 60,
    },

    buttonGroup: {
        width: `${LEFT_PANEL_PERCENT}%`,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 10,
        borderWidth: width.section,
        borderColor: color.accent,
    },

    button: {
        height: 40,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: width.default,
        borderColor: color.accent,
        backgroundColor: color.overlay,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonText: {
        fontFamily: "monospace",
        fontWeight: 'bold',
        fontSize: 15,
        color: color.accent,
    },

    totalBlock: {
        width: `${100 - LEFT_PANEL_PERCENT}%`,
        borderWidth: width.section,
        borderColor: color.accent,
        borderLeftWidth: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },

    totalText: {
        fontFamily: "monospace",
        fontWeight: 'bold',
        fontSize: 18,
        color: color.accent,
    },
});