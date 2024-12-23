<<<<<<< HEAD
import { randomBytes } from "crypto";

export async function generateToken() {
  // Generate random bytes
  const buffer = randomBytes(32 / 2);
  // Convert to hex string
  return await buffer.toString("hex");
}

export async function generateInvitePassword() {
  // Generate random bytes
  const buffer = randomBytes(12 / 2);
  // Convert to hex string
  return await buffer.toString("hex");
=======
import { randomBytes } from 'crypto';

export async function generateToken() {
    const buffer = randomBytes(32 / 2);
    return buffer.toString('hex');
>>>>>>> 9385d4afc9c5977b2b8cdb84da39eae08c1a7ca3
}
