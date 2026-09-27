import { Pressable, StyleSheet, Text, View } from "react-native";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useProducts, useUsers } from "../provider";
import Currency from "../../currency";
import statics from "@/src/static";
import { COLUMNS } from "./userlist";
import { Overlay } from "./overlay";
import { ProductManager } from "./overlays/product";
import { UserManager } from "./overlays/user";
import { FactionManager } from "./overlays/faction";
import { Ledger } from "./overlays/ledger";

type UtilityButtonData = {
    label: string;
    component?: ReactNode;
};

const { color, border } = statics;

const LEFT_PANEL_PERCENT = (100 / 6) * COLUMNS;

function UtilityButton({
    label,
    onPress,
    disabled = false,
}: {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.6 },
                disabled && { opacity: 0.4 },
            ]}
            disabled={disabled}
            onPress={onPress}
        >
            <Text style={styles.buttonText}>{label}</Text>
        </Pressable>
    );
}

export function Utilitybar() {
    const { productList, sellingList } = useProducts();
    const { selectedUsers } = useUsers();
    const [overlay, setOverlay] = useState<number | null>(null);

    const exit = useCallback(() => setOverlay(null), []);

    const UtilityButtonList: UtilityButtonData[] = [
        {
            label: "Beheer speltakken",
            component: <FactionManager exit={exit} />,
        },
        { label: "Beheer gebruikers", component: <UserManager exit={exit} /> },
        {
            label: "Beheer producten",
            component: <ProductManager exit={exit} />,
        },
        { label: "Schrijf producten af", component: <Ledger exit={exit} /> },
    ];

    const total = useMemo(() => {
        let total = new Currency();

        sellingList.forEach((value, key) => {
            const product = productList.find((p) => p.id === key);
            if (product) {
                const price = product.price.mul(value);
                total = total.add(price);
            }
        });
        return total;
    }, [sellingList, productList]);

    if (__DEV__) console.log(`total: ${total}`);
    if (__DEV__) console.log(`overlay: ${overlay}`);

    return (
        <>
            <View style={styles.container}>
                <View style={styles.buttonGroup}>
                    {UtilityButtonList.map(({ label }, index) => {
                        const disabled =
                            index === UtilityButtonList.length - 1 &&
                            (sellingList.size <= 0 || selectedUsers.size <= 0);

                        return (
                            <UtilityButton
                                key={index}
                                label={label}
                                onPress={() => {
                                    setOverlay(index);
                                }}
                                disabled={disabled}
                            />
                        );
                    })}
                </View>
                <View style={styles.totalBlock}>
                    <Text style={styles.totalText}>
                        Totaal: {total.toString()}
                    </Text>
                </View>
            </View>
            {typeof overlay === "number" &&
                UtilityButtonList[overlay].component}
        </>
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
        flexDirection: "row",
        width: "100%",
        height: 60,
    },

    buttonGroup: {
        width: `${LEFT_PANEL_PERCENT}%`,
        flexDirection: "row",
        alignItems: "stretch",
        gap: 10,
        padding: 10,
        ...border.section,
    },

    button: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        backgroundColor: color.overlay,
        alignItems: "center",
        justifyContent: "center",
        ...border.default,
    },

    buttonText: {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 15,
        color: color.primary,
    },

    totalBlock: {
        width: `${100 - LEFT_PANEL_PERCENT}%`,
        borderWidth: statics.width.section,
        borderColor: color.primary,
        borderLeftWidth: 0,
        alignItems: "center",
        justifyContent: "center",
    },

    totalText: {
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: 18,
        color: color.primary,
    },
});
