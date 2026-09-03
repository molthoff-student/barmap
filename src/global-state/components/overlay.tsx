import { generateSha256 } from "@/src/administration/hasher";
import { selectUserIcon, selectProductIcon } from "@/src/administration/icons";
import Currency from "@/src/currency";
import { useDatabase } from "@/src/database/provider";
import { User } from "@/src/database/repositories/users";
import { ReactNode, useCallback, useState } from "react";
import { Alert, Button, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useProducts, useUsers } from "../provider";
import { Product } from "@/src/database/repositories/products";
import statics from "@/src/static";

export type UserTag = {
    id: number,
    name: string,
    balance: Currency
}

export function Overlay({ children, exit }: {
    exit: () => void;
    children?: ReactNode;
}) {
    return (
        <Modal transparent animationType="fade">
            <View style={styles.overlay}>
                <Pressable
                    style={[StyleSheet.absoluteFill, styles.background]}
                    onPress={exit}
                />

                <View style={styles.content}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}

export function AdminOverlay({ exit, children }: {
    exit: () => void,
    children: ReactNode,
}) {
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);

    const checkPassword = useCallback(async () => {
        const hash = await generateSha256(password);
        const pass = process.env.EXPO_PUBLIC_ADMIN_ACCESS_KEY;
        setSuccess(hash === pass);
    }, [password]);

    return (
        <Overlay exit={exit}>
            {success 
            ?   <>{children}</>
            :   <View style={styles.popup}>
                    <Text style={styles.title}>Beheerder toegang</Text>
                    <TextInput
                        style={styles.passwordInput}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Wachtwoord"
                    />
                    <Button title="Ga door" onPress={checkPassword} />
                </View>
            }
        </Overlay>
    );
}

export function EditUser({ user, exit }: { 
    user: User,
    exit: () => void,
}) {
    const { users } = useDatabase();
    const { updateUsers } = useUsers();
    const [username, setUsername] = useState(user.username);
    const [deposit, setDeposit] = useState(new Currency(0));

    const checkDeposit = (value: string) => {
        const digits = Number(value.replace(/\D/g, "") || 0);
        const deposit = new Currency(digits);
        setDeposit(deposit);
    }

    const editUserName = async (text: string) => {
        const name = text.trim().slice(0, 16);
        setUsername(name);
    }

    const saveUserEdit = async () => {
        const given_money = user.given_money.add(deposit);
        const balance = given_money.sub(user.spent_money);
        const newUser: User = {
            id: user.id,
            given_money,
            spent_money: user.spent_money,
            balance: balance,
            username: username.trim().slice(0, 16),
            faction: user.faction,
        }

        try {
            await users.editUser(newUser);
        } catch (reason) {
            Alert.alert(
                "Gebruiker kon niet worden gewijzigd", 
                `${reason}`
            );
        }

        updateUsers();
        exit();
    }

    return (
        <AdminOverlay exit={exit}>
            <View style={styles.popup}>
                <View style={styles.editor}>
                    <Text style={styles.label}>Verander gebruikersnaam:</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={editUserName}
                        placeholder="Nieuwe gebruikersnaam"
                    />
                </View>
                <View style={styles.editor}>
                    <Text style={styles.label}>Voeg geld toe:</Text>
                    <TextInput
                        style={styles.input}
                        value={deposit.toString()}
                        onChangeText={checkDeposit}
                        placeholder="€    0.00"
                    />
                </View>
                <Button title="Verander profielfoto" onPress={() => selectUserIcon(user.id)} />
                <Button title="Bewaar" onPress={saveUserEdit} />
            </View> 
        </AdminOverlay>
    );
}

export function EditProduct({ product, exit }: {
    product: Product,
    exit: () => void,
}) {
    const { products } = useDatabase();
    const { updateProducts } = useProducts();

    const [name, setName] = useState(product.name)
    const [price, setPrice] = useState(new Currency(product.price));
    
    const checkPrice = (value: string) => {
        const digits = Number(value.replace(/\D/g, "") || 0);
        const price = new Currency(digits);
        setPrice(price);
    }

    const saveProductEdit = async () => {
        const newProduct: Product = {
            id: product.id,
            name: name,
            price: price.value,
            active: product.active,
        }

        try {
            await products.editProduct(newProduct);
        } catch(reason) {
            Alert.alert(
                "Product kon niet worden gewijzigd",
                `${reason}`
            );
        }

        updateProducts();
        exit();
    }

    return (
        <AdminOverlay exit={exit}>
            <View style={styles.popup}>
                <View style={styles.editor}>
                    <Text style={styles.label}>Verander productnaam:</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nieuwe productnaam"
                    />
                </View>
                <View style={styles.editor}>
                    <Text style={styles.label}>Verander prijs:</Text>
                    <TextInput
                        style={styles.input}
                        value={price.toString()}
                        onChangeText={checkPrice}
                        placeholder={new Currency(0).toString()}
                    />
                </View>
                <Button title="Verander afbeelding" onPress={() => selectProductIcon(product.id)} />
                <Button title="Bewaar" onPress={saveProductEdit} />
            </View>         
        </AdminOverlay>
    );
}

const { color, border } = statics;
const { width } = border;
const styles = StyleSheet.create({

    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    content: {
        width: "100%",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    background: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },

    popup: {
        width: "80%",
        padding: 20,
        borderRadius: 12,
        backgroundColor: color.default,
    },

    title: {
        fontSize: 20,
        marginBottom: 15,
    },

    editor: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },

    label: {
        width: 230,
        fontSize: 18,
        fontWeight: 'bold',
        color: color.accent,
    },

    input: {
        flex: 1,
        height: 45,
        borderWidth: width.default,
        borderColor: color.lowlight,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 18,
        color: color.accent,
    },

    passwordInput: {
        width: "100%",
        height: 45,
        borderWidth: width.default,
        borderColor: color.lowlight,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 18,
        color: color.accent,
    },
});