import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED);
        }

        const mentor = await prisma.mentor.findUnique({
            where: { userId: payload.userId },
            include: {
                feedbackGiven: {
                    select: { studentId: true }
                }
            }
        });

        if (!mentor) {
            return errorResponse('Mentor not found', HTTP_STATUS.NOT_FOUND);
        }

        // Get unique student IDs from feedback
        const studentIds = [...new Set(mentor.feedbackGiven.map(f => f.studentId))];

        // Fetch students with their application counts
        const students = await Promise.all(
            studentIds.map(async (studentId) => {
                const student = await prisma.student.findUnique({
                    where: { id: studentId },
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        },
                        applications: {
                            select: {
                                status: true
                            }
                        }
                    }
                });

                if (!student) return null;

                const applicationCount = student.applications.length;
                const appliedCount = student.applications.filter(a => a.status === 'APPLIED').length;
                const interviewCount = student.applications.filter(a =>
                    ['SCREENING', 'INTERVIEW', 'TECHNICAL'].includes(a.status)
                ).length;
                const offerCount = student.applications.filter(a =>
                    ['OFFER', 'ACCEPTED'].includes(a.status)
                ).length;

                return {
                    id: student.id,
                    user: {
                        fullName: `${student.user.firstName} ${student.user.lastName}`,
                        email: student.user.email
                    },
                    university: student.university,
                    major: student.major,
                    graduationYear: student.graduationYear,
                    applicationCount,
                    appliedCount,
                    interviewCount,
                    offerCount
                };
            })
        );

        return successResponse(students.filter(s => s !== null));
    } catch (error) {
        console.error('Failed to fetch students:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
