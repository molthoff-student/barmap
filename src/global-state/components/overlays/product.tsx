import {
    FlatList,
    StyleProp,
    View,
    ViewStyle,
    TextInput,
    Text,
    StyleSheet,
} from "react-native";
import { AdminOverlay } from "../overlay";
import { Product } from "@/src/database/repositories/products";
import { useCallback, useEffect, useState } from "react";
import Currency from "@/src/currency";
import { useProducts } from "../../provider";
import { useDatabase } from "@/src/database/provider";
import { selectProductIcon } from "@/src/administration/icons";
import {
    Button,
    editObjCallback,
    IconPicker,
    sanitizeText,
    Seperator,
    createStyles,
    styles as sharedStyles,
    ListHeader,
    EditCurrency,
    EditToggle,
    tryDbStore,
    useSearchEngine,
    filterStr,
} from "./shared";
import Loading from "@/src/loading";

const defaultName = "Nieuw product";
const defaultProduct: Product = {
    id: 0,
    name: defaultName,
    price: new Currency(),
    active: false,
};

const Saving = () => <Loading message="Saving products..." />;
const Fetching = () => <Loading message="Fetching products..." />;

function ConfigureProduct({
    product,
    setProduct,
    style,
    store,
}: {
    product: Product;
    setProduct: (product: Product) => void;
    style?: StyleProp<ViewStyle>;
    store?: (product: Product) => Promise<void | number>;
}) {
    const editProduct = editObjCallback(product, setProduct);

    const onChangeText = useCallback(
        (text: string) => {
            const newName = sanitizeText(text);
            if (newName !== null) editProduct((next) => (next.name = newName));
        },
        [editProduct, sanitizeText],
    );

    const editPrice = useCallback(
        (price: Currency) => {
            editProduct((next) => (next.price = price));
        },
        [editProduct],
    );

    return (
        <View style={[styles.popup, style]}>
            <IconPicker
                id={product.id}
                icon={"product"}
                onPress={() => selectProductIcon(product.id)}
            />
            <View style={{ flex: 1 }}>
                <View style={styles.editor}>
                    <Text style={styles.label}>{"Naam:"}</Text>
                    <TextInput
                        style={styles.input}
                        value={product.name}
                        onChangeText={onChangeText}
                        placeholder="Product naam"
                    />
                </View>
                <EditCurrency
                    label="Prijs:"
                    value={product.price}
                    onChange={editPrice}
                />
                <EditToggle
                    label="Actief:"
                    value={product.active}
                    onValueChange={(value) =>
                        editProduct((next) => (next.active = value))
                    }
                />
                {store && (
                    <Button title="Bewaar" onPress={() => store(product)} />
                )}
            </View>
        </View>
    );
}

export function EditProduct({
    exit,
    product,
    setProduct,
}: {
    exit: () => void;
    product: Product;
    setProduct: (product: Product) => void;
}) {
    const { products } = useDatabase();
    const { updateProducts } = useProducts();
    const [loadRequest, setLoadRequest] = useState(false);

    const store = useCallback(
        tryDbStore(
            products.editProduct,
            updateProducts,
            setLoadRequest,
            "product",
        ),
        [products, setProduct, updateProducts],
    );
    return loadRequest ? (
        <Saving />
    ) : (
        <AdminOverlay exit={exit}>
            <ConfigureProduct
                store={store}
                product={product}
                setProduct={setProduct}
                style={styles.listItem}
            />
        </AdminOverlay>
    );
}

export function ProductManager({ exit }: { exit: () => void }) {
    const { products } = useDatabase();
    const { updateProducts } = useProducts();

    const [loadRequest, setLoadRequest] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[] | null>(null);

    const getString = useCallback(
        (product: Product) => filterStr(product.name),
        [filterStr],
    );
    const [filteredProducts, search, setSearch] = useSearchEngine(
        allProducts,
        getString,
    );
    const setProduct = useCallback(
        (product: Product) => {
            setAllProducts((current) => {
                if (!current) return current;
                return current.map((p) => (p.id === product.id ? product : p));
            });
        },
        [setAllProducts],
    );

    const storeAll = useCallback(
        tryDbStore(
            async (list: Product[]) => {
                for (const product of list) {
                    await products.editProduct(product);
                }
            },
            updateProducts,
            setLoadRequest,
            "product",
        ),
        [products, setProduct, updateProducts],
    );

    const createNew = useCallback(
        tryDbStore(
            products.addProduct,
            updateProducts,
            setLoadRequest,
            "product",
        ),
        [products, setProduct, updateProducts],
    );

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await products.getAllProducts();
            setAllProducts(allProducts);
        };
        loadProducts();
    }, [products]);

    const renderItem = ({ item }: { item: Product }) => {
        console.log(`rendering procuct: ${item.name}`);
        return (
            <ConfigureProduct
                product={item}
                setProduct={setProduct}
                style={styles.listItem}
            />
        );
    };

    return loadRequest ? (
        <Saving />
    ) : (
        <AdminOverlay exit={exit}>
            {allProducts ? (
                <View style={styles.list}>
                    <ListHeader
                        description="product"
                        search={search}
                        setSearch={setSearch}
                        createNew={() => createNew(defaultProduct)}
                    />
                    <Seperator />

                    <FlatList
                        data={filteredProducts}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={1}
                        renderItem={renderItem}
                    />

                    <Seperator />

                    <Button
                        title="Bewaar wijzigingen"
                        onPress={() => storeAll(allProducts)}
                    />
                </View>
            ) : (
                <Fetching />
            )}
        </AdminOverlay>
    );
}

const overlayWidth = "60%";
const styles = StyleSheet.create({
    ...createStyles(overlayWidth),
    ...sharedStyles,
});
