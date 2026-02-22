import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { paginatedResponse, successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { createInternshipSchema } from '@/lib/validators/schemas';
import { UserRole } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search');
        const type = searchParams.get('type');

        const where: any = { isActive: true };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type) where.type = type;

        const [internships, total] = await Promise.all([
            prisma.internship.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    test: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }),
            prisma.internship.count({ where }),
        ]);

        return paginatedResponse(internships, page, limit, total);
    } catch (error) {
        return handleRouteError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const validatedData = createInternshipSchema.parse(body);

        const internship = await prisma.internship.create({
            data: {
                ...validatedData,
                applicationDeadline: validatedData.applicationDeadline ? new Date(validatedData.applicationDeadline) : null,
                startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
            },
        });

        return successResponse(internship, 'Internship created successfully', 201);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }
        return handleRouteError(error);
    }
}
