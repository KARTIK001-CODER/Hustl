import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { createFeedbackSchema } from '@/lib/validators/schemas';
import { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const cookieToken = request.cookies.get('auth_token')?.value;
        const headerToken = extractTokenFromHeader(request.headers.get('Authorization'));
        const token = cookieToken || headerToken;

        if (!token) {
            return errorResponse('Unauthorized', 401);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return errorResponse('Invalid token', 401);
        }

        let feedback;

        if (payload.role === UserRole.STUDENT) {
            const student = await prisma.student.findUnique({
                where: { userId: payload.userId },
            });

            if (!student) {
                return errorResponse('Student not found', 404);
            }

            feedback = await prisma.feedback.findMany({
                where: { studentId: student.id },
                include: {
                    mentor: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } else if (payload.role === UserRole.MENTOR) {
            const mentor = await prisma.mentor.findUnique({
                where: { userId: payload.userId },
            });

            if (!mentor) {
                return errorResponse('Mentor not found', 404);
            }

            feedback = await prisma.feedback.findMany({
                where: { mentorId: mentor.id },
                include: {
                    student: {
                        include: {
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } else {
            return errorResponse('Forbidden', 403);
        }

        return successResponse(feedback);
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
        if (!payload || payload.role !== UserRole.MENTOR) {
            return errorResponse('Forbidden', 403);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId: payload.userId },
        });

        if (!mentor) {
            return errorResponse('Mentor not found', 404);
        }

        const body = await request.json();
        const validatedData = createFeedbackSchema.parse(body);

        const feedback = await prisma.feedback.create({
            data: {
                mentorId: mentor.id,
                studentId: validatedData.studentId,
                rating: validatedData.rating,
                comment: validatedData.comment,
                sentiment: validatedData.sentiment,
                actionItems: validatedData.actionItems,
            },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        return successResponse(feedback, 'Feedback submitted successfully', 201);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }
        return handleRouteError(error);
    }
}
