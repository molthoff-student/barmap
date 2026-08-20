import * as crypto from 'crypto';

export function hasher(str: string): string {
    return crypto
        .createHash('sha512', { outputLength: 32 })
        .update(str)
        .digest('hex');
}