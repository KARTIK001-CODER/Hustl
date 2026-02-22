import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { createApplicationSchema } from '@/lib/validators/schemas';
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

        // Get student record
        const student = await prisma.student.findUnique({
            where: { userId: payload.userId },
        });

        if (!student) {
            return errorResponse('Student not found', 404);
        }

        // Get applications
        const applications = await prisma.application.findMany({
            where: { studentId: student.id },
            include: {
                internship: true,
            },
            orderBy: { appliedAt: 'desc' },
        });

        return successResponse(applications);
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
        if (!payload || payload.role !== UserRole.STUDENT) {
            return errorResponse('Forbidden', 403);
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId },
        });

        if (!student) {
            return errorResponse('Student not found', 404);
        }

        const body = await request.json();
        const validatedData = createApplicationSchema.parse(body);

        // ⭐ PER-INTERNSHIP ELIGIBILITY CHECK
        const internship = await prisma.internship.findUnique({
            where: { id: validatedData.internshipId },
            include: { test: true }
        });

        if (!internship) {
            return errorResponse('Internship not found', 404);
        }

        if (internship.testId) {
            const hasPassedTest = await prisma.testAttempt.findFirst({
                where: {
                    studentId: student.id,
                    testId: internship.testId,
                    passed: true
                }
            });

            if (!hasPassedTest) {
                return errorResponse(
                    `You must pass the eligibility test for "${internship.title}" before applying.`,
                    403
                );
            }
        }

        // Check if already applied
        const existing = await prisma.application.findUnique({
            where: {
                studentId_internshipId: {
                    studentId: student.id,
                    internshipId: validatedData.internshipId,
                },
            },
        });

        if (existing) {
            return errorResponse('Already applied to this internship', 409);
        }

        const application = await prisma.application.create({
            data: {
                studentId: student.id,
                internshipId: validatedData.internshipId,
                coverLetter: validatedData.coverLetter,
                resumeUrl: validatedData.resumeUrl,
            },
            include: {
                internship: true,
            },
        });

        return successResponse(application, 'Application submitted successfully', 201);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }
        return handleRouteError(error);
    }
}
