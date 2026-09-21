import { generateSha256 } from "@/src/administration/hasher";
import Currency from "@/src/currency";
import { ReactNode, useCallback, useState } from "react";
import {
    Alert,
    Button,
    Modal,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    View,
    ViewStyle,
} from "react-native";
import { fonts, color, border } from "@/src/static";

const replacer = (_: string, value: unknown) =>
    value instanceof Currency ? value.toString() : value;

export type UserTag = {
    id: number;
    name: string;
    balance: Currency;
};

export function Overlay({
    children,
    style,
    noViewStyle = false,
    exit,
}: {
    exit?: () => void;
    style?: StyleProp<ViewStyle>;
    children?: ReactNode;
    noViewStyle?: boolean;
}) {
    return (
        <Modal transparent animationType="fade">
            <View style={styles.overlay}>
                {exit !== undefined && (
                    <Pressable
                        style={[
                            StyleSheet.absoluteFill,
                            styles.background,
                            style,
                        ]}
                        onPress={exit}
                    />
                )}
                {noViewStyle ? (
                    <>{children}</>
                ) : (
                    <View style={styles.content}>{children}</View>
                )}
            </View>
        </Modal>
    );
}

export function AdminOverlay({
    children,
    style,
    noViewStyle = false,
    exit,
}: {
    exit?: () => void;
    style?: StyleProp<ViewStyle>;
    children?: ReactNode;
    noViewStyle?: boolean;
}) {
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState(true);

    const checkPassword = useCallback(async () => {
        const hash = await generateSha256(password);
        const pass = process.env.EXPO_PUBLIC_ADMIN_ACCESS_KEY;
        setSuccess(hash === pass);
    }, [password]);

    return (
        <Overlay exit={exit} noViewStyle={noViewStyle} style={style}>
            {success ? (
                <>{children}</>
            ) : (
                <View style={styles.popup}>
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
            )}
        </Overlay>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        width: "80%",
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
    passwordInput: {
        width: "100%",
        height: 45,
        paddingHorizontal: 10,
        marginBottom: 15,
        color: color.accent,
        ...fonts.default,
        ...border.input,
    },
});
