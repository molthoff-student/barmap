import { CurrencyInput } from "@/src/administration/currency-input";
import Currency from "@/src/currency";
import { useCallback, useMemo, useState } from "react";
import {
    Alert,
    AlertButton,
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import statics from "@/src/static";
import { Picker } from "@react-native-picker/picker";
import { ProductIcon, UserIcon } from "@/src/administration/icons";

const Continue: AlertButton[] = [{ text: "Ga door" }];

// export const saveSuccess = (desc: string) =>
//     Alert.alert(desc + " opgeslagen", undefined, Continue);
export const saveFailure = (desc: string, message: string | undefined) =>
    Alert.alert(`Kon ${desc} niet opslaan`, message);

export function editObjCallback<T>(obj: T, setObj: (user: T) => void) {
    return useCallback(
        (callback: (next: T) => void) => {
            const next = { ...obj };
            callback(next);
            setObj(next);
        },
        [obj],
    );
}

export function tryDbStore<T>(
    callback: (obj: T) => Promise<any>,
    update: () => Promise<void>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    description: string,
): (obj: T) => Promise<void> {
    return async (obj: T) => {
        setLoading(true);
        try {
            await callback(obj);
            await update();
            setLoading(false);
        } catch (reason: any) {
            setLoading(false);
            saveFailure(description, reason.message);
        }
    };
}

export const filterStr = (str: string) => str.toLowerCase().replace(/\s+/g, "");

export function sanitizeText(text: string): string | null {
    const res = text.trimStart().replace(/[^a-zA-Z ]/g, "");
    if (res.length <= 16) return res;
    return null;
}

export function useSearchEngine<T>(
    data: T[] | null,
    // setData: (value: React.SetStateAction<T[] | null>) => void,
    getString: (item: T) => string,
): [T[], string, (value: React.SetStateAction<string>) => void] {
    const [search, setSearch] = useState("");
    const cached = useMemo(() => {
        return data ? data.map(getString) : [];
    }, [data, getString]);

    const results = useMemo(() => {
        if (!data) return [];
        const filter = filterStr(search);
        if (filter === "") return data;

        const results = [];
        for (let i = 0; i < cached.length; i++) {
            const includes = cached[i].includes(filter);
            if (includes) {
                results.push(data[i]);
            }
        }
        return results;
    }, [search, data, cached]);

    return [results, search, setSearch];
}

export const EditToggle = ({
    label,
    value,
    onValueChange,
}: {
    label?: string | undefined;
    value?: boolean | undefined;
    onValueChange?: ((text: boolean) => void) | undefined;
}) => (
    <View style={styles.editor}>
        <Text style={styles.label}>{label}</Text>
        <Switch value={value} onValueChange={onValueChange} />
    </View>
);

export const EditCurrency = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: Currency;
    onChange: (next: Currency) => void | undefined;
}) => (
    <View style={styles.editor}>
        <Text style={styles.label}>{label}</Text>
        <CurrencyInput
            value={value}
            onChange={onChange}
            viewStyle={styles.input}
        />
    </View>
);

export const ItemPicker = ({
    label,
    valueList,
    selectedValue,
    onValueChange,
}: {
    label: string;
    valueList: string[];
    selectedValue: string;
    onValueChange: (value: string, index: number) => void;
}) => (
    <View style={styles.editor}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.pickerWrapper}>
            <Picker
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={styles.picker}
            >
                {valueList.map((v, index) => (
                    <Picker.Item
                        key={index}
                        label={v}
                        value={v}
                        style={styles.pickerItem}
                    />
                ))}
            </Picker>
        </View>
    </View>
);

const iconOptions = {
    user: UserIcon,
    product: ProductIcon,
};

export function IconPicker({
    id,
    icon,
    onPress,
}: {
    id: number;
    icon: keyof typeof iconOptions;
    onPress?: ((event: GestureResponderEvent) => void) | null | undefined;
}) {
    const IconComponent = iconOptions[icon];
    return (
        <Pressable style={styles.icon} onPress={onPress}>
            <IconComponent id={id} />
        </Pressable>
    );
}

export const ListHeader = ({
    description,
    search,
    setSearch,
    createNew,
}: {
    description: string;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    createNew: () => Promise<void>;
}) => (
    <View style={styles.search}>
        <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={`Zoek naar ${description}`}
        />
        <View
            style={{
                marginLeft: "auto",
            }}
        >
            <Pressable
                style={({ pressed }) => [
                    styles.searchButton,
                    pressed && { opacity: 0.5 },
                ]}
                onPress={createNew}
            >
                <Text style={fonts.default}>{`Voeg ${description} toe`}</Text>
            </Pressable>
        </View>
    </View>
);

export const Seperator = () => <View style={styles.seperator} />;

export function Button({
    title,
    onPress,
    disabled = false,
    // buttonStyle,
    // textStyle,
}: {
    title?: string;
    onPress?: (() => void) | (() => Promise<void>);
    disabled?: boolean;
    // buttonStyle?:
    //     | StyleProp<ViewStyle>
    //     | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
    // textStyle?: StyleProp<TextStyle>;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                disabled && styles.buttonDisabled,
            ]}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </Pressable>
    );
}

const { color, border, fonts } = statics;

export const styles = StyleSheet.create({
    listContent: {
        alignItems: "center",
        gap: 12,
        padding: 20,
    },
    listItem: {
        width: "100%",
        ...border.default,
    },
    editor: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        width: "30%",
        marginBottom: 10,
        ...fonts.default,
    },
    input: {
        width: "70%",
        flex: 1,
        height: 45,
        marginBottom: 10,
        paddingHorizontal: 10,
        ...fonts.default,
        ...border.input,
    },
    search: {
        width: "100%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        padding: 5,
        gap: 5,
    },
    searchInput: {
        flex: 1,
        height: 45,
        // alignItems: "center",
        // justifyContent: "center",
        textAlignVertical: "center",
        paddingVertical: 0,
        paddingHorizontal: 10,
        ...fonts.default,
        ...border.input,
    },
    searchButton: {
        height: 45,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
        ...border.input,
    },
    button: {
        minHeight: 48,
        minWidth: 64,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        // borderRadius: 2,
        backgroundColor: color.secondary,
        color: color.secondary,
        elevation: 2,
    },
    buttonPressed: {
        opacity: 0.6,
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        ...fonts.bold,
        color: color.default,
    },
    pickerWrapper: {
        width: "60%",
        flex: 1,
        height: 45,
        marginBottom: 10,
        justifyContent: "center",
        overflow: "hidden",
        ...border.input,
    },
    picker: {
        width: "100%",
        ...fonts.bold,
    },
    pickerItem: fonts.default,
    icon: {
        aspectRatio: 1,
        overflow: "hidden",
        position: "relative",
        ...border.icon,
    },
    seperator: {
        width: "100%",
        borderBottomColor: color.primary,
        borderBottomWidth: statics.width.default,
    },
});

export function createStyles(overlayWidth: `${number}%`) {
    return StyleSheet.create({
        popup: {
            width: overlayWidth,
            padding: 20,
            borderRadius: 12,
            backgroundColor: color.default,
            flexDirection: "row",
            gap: 12,
        },
        list: {
            width: overlayWidth,
            alignSelf: "center",
            backgroundColor: color.default,
            height: "100%",
            ...border.default,
        },
    });
}
