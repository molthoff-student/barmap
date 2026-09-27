import React, { useCallback, useMemo, useState } from "react";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import Currency from "../currency";

type CurrencyInputProps = {
    value: Currency;
    onChange: (value: Currency) => void;
    viewStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

export function CurrencyInput({
    value,
    onChange,
    viewStyle,
    textStyle,
}: CurrencyInputProps) {
    const displayValue = useMemo(() => (value.value / 100).toFixed(2), [value]);

    const onChangeText = useCallback(
        (text: string) => {
            const digits = text.replace(/\D/g, "");
            const value = digits === "" ? 0 : Number(digits);
            const currency = new Currency(value);
            onChange(currency);
        },
        [onChange],
    );

    return (
        <View style={[viewStyle, styles.container]}>
            <Text style={[textStyle, styles.currency]}>{"€"}</Text>
            <TextInput
                value={displayValue}
                onChangeText={onChangeText}
                keyboardType="number-pad"
                style={[textStyle, styles.input]}
                selectTextOnFocus={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
    },
    currency: {
        marginRight: 4,
    },
    input: {
        flex: 1,
    },
});
