import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

export async function GET(
    request: NextRequest,
    { params }: { params: { studentId: string } }
) {
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED);
        }

        // Verify the student exists
        const student = await prisma.student.findUnique({
            where: { id: params.studentId }
        });

        if (!student) {
            return errorResponse('Student not found', HTTP_STATUS.NOT_FOUND);
        }

        // Fetch student's applications
        const applications = await prisma.application.findMany({
            where: { studentId: params.studentId },
            include: {
                internship: {
                    select: {
                        title: true,
                        company: true
                    }
                }
            },
            orderBy: { appliedAt: 'desc' }
        });

        // Format the response
        const formattedApplications = applications.map(app => ({
            id: app.id,
            company: app.internship.company,
            position: app.internship.title,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        return successResponse(formattedApplications);
    } catch (error) {
        console.error('Failed to fetch student applications:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
