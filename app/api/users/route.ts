import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { paginatedResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { UserRole } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        // Get token
        const cookieToken = request.cookies.get('auth_token')?.value;
        const headerToken = extractTokenFromHeader(request.headers.get('Authorization'));
        const token = cookieToken || headerToken;

        if (!token) {
            return errorResponse('Unauthorized', 401);
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== UserRole.ADMIN) {
            return errorResponse('Forbidden', 403);
        }

        // Get query params
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const role = searchParams.get('role');
        const search = searchParams.get('search');

        // Build where clause
        const where: any = {};
        if (role) where.role = role;
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Get users
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return paginatedResponse(users, page, limit, total);
    } catch (error) {
        return handleRouteError(error);
    }
}
