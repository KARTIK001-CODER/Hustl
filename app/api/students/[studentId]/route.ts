import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const { studentId } = await params;

    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED);
        }

        // Allow mentor to see any student that applied to their company or that they've mentored
        // For now, keeping it simple: any authenticated mentor/admin can view student profiles
        if (payload.role !== 'MENTOR' && payload.role !== 'ADMIN' && payload.userId !== studentId) {
            // Check if student is viewing own profile
            const student = await prisma.student.findUnique({
                where: { userId: payload.userId }
            });
            if (!student || student.id !== studentId) {
                return errorResponse('Forbidden', HTTP_STATUS.FORBIDDEN);
            }
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                },
                applications: {
                    include: {
                        internship: {
                            select: {
                                title: true,
                                company: true
                            }
                        }
                    },
                    orderBy: { appliedAt: 'desc' }
                },
                testAttemptRecords: {
                    include: {
                        test: {
                            select: {
                                title: true
                            }
                        }
                    },
                    orderBy: { completedAt: 'desc' }
                }
            }
        });

        if (!student) {
            return errorResponse('Student not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(student);
    } catch (error) {
        return handleRouteError(error);
    }
}
