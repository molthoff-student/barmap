import {
    FlatList,
    Insets,
    Pressable,
    PressableProps,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useProducts } from "../provider";
import { Product } from "../../database/repositories/products";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditProduct } from "./overlays/product";
import { ProductIcon } from "@/src/administration/icons";
import Currency from "../../currency";
import statics from "@/src/static";

const ADD = "+";
const SUB = "-";
const COLUMNS = 2;
const GAP = 3;
const CARD_WIDTH = 100 / COLUMNS - GAP;
const HITSLOP_RADIUS = 25;
const hitSlopHorizontal: Insets = {
    left: HITSLOP_RADIUS,
    right: HITSLOP_RADIUS,
};
const hitSlopTop: Insets = {
    top: HITSLOP_RADIUS,
    ...hitSlopHorizontal,
};
const hitSlopBottom: Insets = {
    bottom: HITSLOP_RADIUS,
    ...hitSlopHorizontal,
};

function ControlsRow({
    button,
    description,
    price,
    onPress,
    onHeld,
    style,
    hitSlop,
}: {
    button: string;
    description: string | number | boolean;
    price: Currency | number;
    onPress: () => void;
    onHeld: () => void;
    style: typeof styles.sub | typeof styles.add;
    hitSlop: PressableProps["hitSlop"];
}) {
    const interval = useRef<ReturnType<typeof setInterval> | null>(null);
    const wasHeld = useRef(false);

    const clear = () => {
        if (interval.current) {
            clearInterval(interval.current);
            interval.current = null;
        }
    };

    const onPressIn = () => {
        clear();
        wasHeld.current = false;
        interval.current = setInterval(() => {
            wasHeld.current = true;
            onHeld();
        }, 500);
    };

    const onPressOut = () => {
        clear();
    };

    const handlePress = () => {
        if (!wasHeld.current) onPress();
    };

    // Guarantee interval is killed upon a re-render.
    useEffect(() => clear, []);

    return (
        <View style={styles.controlsRow}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && { opacity: 0.5 },
                    style,
                ]}
                hitSlop={hitSlop}
                onPress={handlePress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <Text style={styles.buttonText}>{button}</Text>
            </Pressable>
            <View style={styles.textCell}>
                <Text style={styles.controlsText}>{description}</Text>
                <Text style={styles.controlsText}>{price.toString(5)}</Text>
            </View>
        </View>
    );
}

const ProductCard = React.memo(function ProductCard({
    item,
    quantity,
    sellProduct,
    onEdit,
}: {
    item: Product;
    quantity: number;
    sellProduct: (key: number, increase: boolean, multiplier?: number) => void;
    onEdit: () => void;
}) {
    const active = 0 < quantity;
    const basePrice = item.price;
    const fullPrice = item.price.mul(quantity);

    return (
        <Pressable
            style={[styles.card, active && styles.activeCard]}
            onLongPress={onEdit}
            delayLongPress={500}
        >
            <ProductIcon id={item.id} />
            <View style={styles.overlay}>
                <View style={styles.controlsBlock}>
                    <ControlsRow
                        button={ADD}
                        description={quantity}
                        price={fullPrice}
                        style={styles.add}
                        hitSlop={hitSlopTop}
                        onPress={() => sellProduct(item.id, true)}
                        onHeld={() => sellProduct(item.id, true, 5)}
                    />
                    <View style={styles.divider} />
                    <ControlsRow
                        button={SUB}
                        description={item.name}
                        price={basePrice}
                        style={styles.sub}
                        hitSlop={hitSlopBottom}
                        onPress={() => sellProduct(item.id, false)}
                        onHeld={() => sellProduct(item.id, false, 5)}
                    />
                </View>
            </View>
        </Pressable>
    );
});

export default function Catalog() {
    const { productList, sellingList, sellProduct } = useProducts();
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    if (__DEV__) {
        const list = [...sellingList.entries()].map((product) => {
            const name = productList.find(
                (value) => value.id == product[0],
            )!.name;
            return {
                name: name,
                amount: product[1],
            };
        });

        console.log(`Selected products: ${JSON.stringify(list)}`);
    }

    const renderItem = useCallback(
        ({ item }: { item: Product }) => (
            <ProductCard
                item={item}
                quantity={sellingList.get(item.id) ?? 0}
                sellProduct={sellProduct}
                onEdit={() => setEditProduct(item)}
            />
        ),
        [sellingList],
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={productList}
                numColumns={COLUMNS}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
            />
            {editProduct && (
                <EditProduct
                    exit={() => setEditProduct(null)}
                    product={editProduct}
                    setProduct={setEditProduct}
                />
            )}
        </View>
    );
}

const { color, border, width, fonts } = statics;

const styles = StyleSheet.create({
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },

    listContent: {
        paddingHorizontal: `${GAP / 2}%`,
        paddingVertical: `${GAP / 2}%`,
    },

    card: {
        width: `${CARD_WIDTH}%`,
        aspectRatio: 1,
        marginHorizontal: `${GAP / 2}%`,
        marginVertical: `${GAP / 2}%`,
        backgroundColor: color.overlay,
        position: "relative",
        overflow: "hidden",
        ...border.icon,
    },

    activeCard: {
        borderColor: color.secondary,
        borderWidth: 4,
    },

    container: {
        width: `${(100 / 6) * (6 - 4)}%`,
        height: "100%",
        flex: 1,
        borderRightColor: color.primary,
        borderRightWidth: width.default,
        // ...border.default,
    },

    overlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
    },

    name: {
        marginBottom: 6,
        ...fonts.default,
    },

    controlsBlock: {
        width: "100%",
        borderTopColor: color.primary,
        borderTopWidth: width.default,
    },

    controlsRow: {
        flexDirection: "row",
        height: 30,
    },

    divider: {
        height: width.default,
        backgroundColor: color.primary,
    },

    button: {
        width: 30,
        alignItems: "center",
        justifyContent: "center",
        borderRightWidth: width.default,
        borderRightColor: color.primary,
        ...fonts.default,
    },

    sub: {
        backgroundColor: "#ff3038",
    },

    add: {
        backgroundColor: "#00c76f",
    },

    buttonText: fonts.default,

    textCell: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        backgroundColor: color.overlay,
    },

    controlsText: fonts.bold,
});
