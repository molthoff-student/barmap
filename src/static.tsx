import { StyleSheet } from "react-native";

export const color = {
    default: "#FFFFFF",
    primary: "#0B0227",
    secondary: "#1A1D57",
    accent: "#FCBE00",
    overlay: "rgba(207, 207, 207, 0.66)",
};

const defaultFont = {
    fontSize: 18,
    fontFamily: "monospace",
    color: color.primary,
};

export const fonts = StyleSheet.create({
    default: defaultFont,
    bold: {
        fontWeight: "bold",
        ...defaultFont,
    },
});

const radius = {
    small: 8,
    medium: 12,
    large: 15,
};

const width = {
    default: 2,
    section: 3,
};

export const border = StyleSheet.create({
    default: {
        borderColor: color.primary,
        borderWidth: width.default,
    },
    section: {
        borderColor: color.primary,
        borderWidth: width.section,
    },
    input: {
        borderColor: color.secondary,
        borderWidth: width.default,
        borderRadius: radius.small,
    },
    icon: {
        borderColor: color.secondary,
        borderWidth: width.default,
        borderRadius: radius.large,
    },
});

export default {
    radius,
    color,
    border,
    width,
    fonts,
};
