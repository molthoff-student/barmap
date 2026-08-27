import { generateSha256 } from "@/src/administration/hasher";
import { selectUserIcon, selectProductIcon } from "@/src/administration/icons";
import Currency from "@/src/currency";
import { useDatabase } from "@/src/database/provider";
import { User } from "@/src/database/repositories/users";
import { ACCENT_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_COLOR, LOWLIGHT_COLOR } from "@/src/static";
import { ReactNode, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { useGlobals } from "../provider";
import { Product } from "@/src/database/repositories/products";

export type UserTag = {
    id: number,
    name: string,
    balance: Currency
}

export function AdminOverlay({ exit, children }: {
    exit: () => void,
    children: ReactNode,
}) {


    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(false);


    const checkPassword = async () => {
        const hash = await generateSha256(password);
        const pass = process.env.EXPO_PUBLIC_ADMIN_ACCESS_KEY;

        if (__DEV__) console.log(`GIVEN_ACCESS_KEY: ${hash}`);
        if (__DEV__) console.log(`ADMIN_ACCESS_KEY: ${pass}`);
        if (__DEV__) console.log(`password check: ${hash === pass ? 'success' : 'failed'}`);
        setSuccess(hash === pass);
    }

    return (
        <Modal transparent animationType="fade">
            <View style={styles.overlay}>
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
                        <Button title="Sluit menu" onPress={exit} />
                    </View>
                }
            </View>
        </Modal>
    );
}

export function EditUser({ user, exit }: { 
    user: User,
    exit: () => void,
}) {
    const { users } = useDatabase();
    const { updateUsers } = useGlobals();
    const [username, setUsername] = useState(user.username);
    const [deposit, setDeposit] = useState(new Currency(0));

    const checkDeposit = (value: string) => {
        const digits = Number(value.replace(/\D/g, "") || 0);
        const deposit = new Currency(digits);
        setDeposit(deposit);
    }

    const saveUserEdit = async () => {
        const newUser: User = {
            id: user.id,
            given_money: user.given_money + deposit.value,
            spent_money: user.spent_money,
            username: username,
            faction: user.faction,
        }

        await users.editUser(newUser);

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
                        onChangeText={setUsername}
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
                <Button title="Sluit menu" onPress={exit} />
            </View> 
        </AdminOverlay>
    );
}

export function EditProduct({ product, exit }: {
    product: Product,
    exit: () => void,
}) {
    const { products } = useDatabase();
    const { updateProducts } = useGlobals();

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

        await products.editProduct(newProduct);

            
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
                        placeholder="€    0.00"
                    />
                </View>
                <Button title="Verander afbeelding" onPress={() => selectProductIcon(product.id)} />
                <Button title="Bewaar" onPress={saveProductEdit} />
                <Button title="Sluit menu" onPress={exit} />
            </View>         
        </AdminOverlay>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },

    popup: {
        width: "80%",
        padding: 20,
        borderRadius: 12,
        backgroundColor: DEFAULT_COLOR,
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
        color: ACCENT_COLOR,
    },

    input: {
        flex: 1,
        height: 45,
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderColor: LOWLIGHT_COLOR,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 18,
        color: ACCENT_COLOR,
    },

    passwordInput: {
        width: "100%",
        height: 45,
        borderWidth: DEFAULT_BORDER_WIDTH,
        borderColor: LOWLIGHT_COLOR,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        fontSize: 18,
        color: ACCENT_COLOR,
    },
});