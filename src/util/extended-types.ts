

// Import necessary types from Prisma
export interface UserPayload {
    email: string;
    sub: string;
    role?: object;
}