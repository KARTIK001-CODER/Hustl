import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import {
    comparePasswords,
    generateToken,
    generateSessionToken,
    getSessionExpiration,
    sanitizeUser,
} from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { loginSchema } from '@/lib/validators/schemas';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = loginSchema.parse(body);

        // Find user with role-specific data
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
            include: {
                student: true,
                mentor: true,
                admin: true,
            },
        });

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        // Check if user is active
        if (!user.isActive) {
            return errorResponse('Account is deactivated', 403);
        }

        // Verify password
        const isPasswordValid = await comparePasswords(validatedData.password, user.password);

        if (!isPasswordValid) {
            return errorResponse('Invalid email or password', 401);
        }

        // Create session
        const sessionToken = generateSessionToken();
        const expiresAt = getSessionExpiration();

        await prisma.session.create({
            data: {
                userId: user.id,
                token: sessionToken,
                expiresAt,
            },
        });

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate JWT
        const jwtToken = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Prepare user data with role-specific info
        const userData = {
            ...sanitizeUser(user),
            roleData: user.student || user.mentor || user.admin,
        };

        // Return user data and tokens
        const response = successResponse(
            {
                user: userData,
                token: jwtToken,
                sessionToken,
            },
            'Login successful'
        );

        // Set cookie
        response.cookies.set('auth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }

        // Check if it's a database connection error
        if (error.message && error.message.includes('Database not configured')) {
            return errorResponse(
                'Database is not configured. please visit /setup for instructions.',
                503
            );
        }

        return handleRouteError(error);
    }
}
