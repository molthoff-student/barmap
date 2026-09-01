import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Loading(props: { message: string }) {

    const color = "#00bfff";
    return (
        <View style={styles.loading} >
            <ActivityIndicator 
                size="large"  
                color={color} 
            />
            <Text>
                {props.message}
            </Text>
        </View>
    );    
}

const styles = StyleSheet.create({
    loading: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
});