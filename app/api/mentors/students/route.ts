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

        // Fetch ALL students to allow "Global Discovery" as requested
        const allStudents = await prisma.student.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                applications: {
                    include: {
                        internship: {
                            select: { company: true, title: true }
                        }
                    }
                }
            }
        });

        // Fetch students the mentor has already interacted with (for "Priority" tagging later if needed)
        const studentIdsFromFeedback = mentor.feedbackGiven.map(f => f.studentId);

        const students = allStudents.map(student => {
            // Filter applications for THIS mentor's company
            const companyApplications = student.applications.filter(
                app => app.internship.company.toLowerCase() === mentor.company.toLowerCase()
            );

            // General stats (all companies)
            const totalApplicationCount = student.applications.length;

            // Stats for this mentor's company
            const appliedAtCompanyCount = companyApplications.length;
            const interviewAtCompanyCount = companyApplications.filter(a =>
                ['SCREENING', 'INTERVIEW', 'TECHNICAL'].includes(a.status)
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
                // Direct applications to mentor's company
                companyApplications: companyApplications.map(app => ({
                    id: app.id,
                    title: app.internship.title,
                    status: app.status,
                    appliedAt: app.appliedAt
                })),
                // Flags for the UI
                isYourApplicant: appliedAtCompanyCount > 0,
                hasInteracted: studentIdsFromFeedback.includes(student.id),
                // Statistics
                totalApplicationCount,
                applicationCount: appliedAtCompanyCount, // Keep same key for UI compatibility
                appliedCount: appliedAtCompanyCount,
                interviewCount: interviewAtCompanyCount,
                offerCount: companyApplications.filter(a => ['OFFER', 'ACCEPTED'].includes(a.status)).length
            };
        });

        return successResponse(students);
    } catch (error) {
        console.error('Failed to fetch students:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
