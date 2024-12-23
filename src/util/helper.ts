import { randomBytes } from 'crypto';

export async function generateToken() {
    const buffer = randomBytes(32 / 2);
    return buffer.toString('hex');
}
