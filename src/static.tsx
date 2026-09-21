import { StyleSheet } from "react-native";

export const color = {
    default: "#FFFFFF",
    accent: "#000000",
    overlay: "rgba(207, 207, 207, 0.66)",
    highlight: "#91C5F2",
    lowlight: "#D3D3D3",
};

const defaultFont = {
    fontSize: 18,
    fontFamily: "monospace",
};

export const fonts = StyleSheet.create({
    default: defaultFont,
    bold: {
        fontWeight: "bold",
        ...defaultFont,
    },
});

const width = {
    default: 2,
    section: 3,
};

export const border = StyleSheet.create({
    default: {
        borderColor: color.accent,
        borderWidth: width.default,
    },
    section: {
        borderColor: color.accent,
        borderWidth: width.section,
    },
    input: {
        borderColor: color.lowlight,
        borderWidth: width.default,
        borderRadius: 8,
    },
    icon: {
        borderWidth: width.default,
        borderColor: color.accent,
        borderRadius: 15,
    },
});

export default {
    color,
    border,
    width,
    fonts,
};
