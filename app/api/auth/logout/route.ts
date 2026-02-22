import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        // Get token from cookie or header
        const cookieToken = request.cookies.get('auth_token')?.value;
        const headerToken = extractTokenFromHeader(request.headers.get('Authorization'));
        const token = cookieToken || headerToken;

        if (!token) {
            return errorResponse('No token provided', 401);
        }

        // Verify token
        const payload = verifyToken(token);

        if (!payload) {
            return errorResponse('Invalid token', 401);
        }

        // Delete all sessions for this user
        await prisma.session.deleteMany({
            where: { userId: payload.userId },
        });

        // Return success response
        const response = successResponse(null, 'Logout successful');

        // Clear cookie
        response.cookies.delete('auth_token');

        return response;
    } catch (error) {
        return handleRouteError(error);
    }
}
