import * as Crypto from "expo-crypto";

export async function generateSha256(input: string): Promise<string> {
    return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        input
    );
}