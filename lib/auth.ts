import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const SALT_ROUNDS = 12;

// Password utilities
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
    plainPassword: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
}

// JWT utilities
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// Session utilities
export function generateSessionToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

export function getSessionExpiration(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    return expiresAt;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
    // At least 8 characters
    return password.length >= 8;
}

// Sanitize user data (remove sensitive fields)
export function sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
}

// Extract token from Authorization header
export function extractTokenFromHeader(header: string | null): string | null {
    if (!header) return null;

    const parts = header.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }

    return null;
}
