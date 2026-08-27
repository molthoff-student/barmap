import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useGlobals } from "../provider";
import { Product } from "../../database/repositories/products";
import { useState } from "react";
import { EditProduct } from "./overlay";


const ADD = "+";
const SUB = "-";

function Button(props: { product: Product, style: any, onPress: (id: number) => void, text: string }) {
    return (
        <Pressable 
            style={[styles.button, props.style]} 
            onPress={() => props.onPress(props.product.id)}
        >
            <Text style={styles.buttonText}>{props.text}</Text>
        </Pressable>        
    );
}

export default function Catalog() {
    const { productList, sellingList, sellProduct } = useGlobals();
    const [editProduct, setEditProduct] = useState<Product | null>(null);

    if (__DEV__) {
        const list = [...sellingList.entries()].map(product => {
            const name = productList.find(value => value.id == product[0])!.name
            return {
                name: name,
                amount: product[1]
            }
        });

        console.log(list);
    }

    const increment = (id: number) => sellProduct(id, true);
    const decrement = (id: number) => sellProduct(id, false);

    const renderItem = ({ item }: { item: Product }) => {
        const quantity = sellingList.get(item.id) ?? 0;
        const _active = 0 < quantity;
        
        return (

            <Pressable
                style={styles.card}
                onLongPress={() => setEditProduct(item)}
                delayLongPress={500}
            >
                <Text style={styles.name}>{item.name}</Text>

                <View style={styles.controls}>
                    <Button 
                        product={item} 
                        style={styles.minus} 
                        onPress={decrement}
                        text={SUB}
                    />

                    <View style={styles.quantity}>
                        <Text style={styles.quantityText}>{quantity}</Text>
                    </View>

                    <Button 
                        product={item} 
                        style={styles.plus} 
                        onPress={increment} 
                        text={ADD}
                    />
                </View>
            </Pressable>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={productList}
                numColumns={2}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
            />
            {editProduct &&
                <EditProduct
                    product={editProduct}
                    exit={() => setEditProduct(null)} 
                />
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "80%",
        flex: 1,
        width: 'auto',
    },

    card: {
        width: 200,
        height: 200,
        backgroundColor: '#d9d9d9',
        borderRadius: 34,
        borderColor: '#000000',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 30,
        margin: 3
    },

    name: {
        fontSize: 18,
        color: '#000000',
    },

    controls: {
        height: 45,
        width: 140,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000000',
        borderRadius: 25,
        overflow: 'hidden',
    },

    button: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },

    minus: {
        backgroundColor: '#ff3038',
    },

    plus: {
        backgroundColor: '#00c76f',
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '500',
    },

    quantity: {
        flex: 1,
        height: 42,
        // backgroundColor: '#e9e9e9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    quantityText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#000000',
    },

})