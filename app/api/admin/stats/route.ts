import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';
import { UserRole } from '@prisma/client';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== UserRole.ADMIN) {
            return errorResponse('Forbidden', HTTP_STATUS.FORBIDDEN);
        }

        // Fetch all stats
        const [totalUsers, students, mentors, admins, internships, applications] = await Promise.all([
            prisma.user.count(),
            prisma.student.count(),
            prisma.mentor.count(),
            prisma.admin.count(),
            prisma.internship.count({ where: { isActive: true } }),
            prisma.application.count()
        ]);

        // Calculate new users this month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const newUsersThisMonth = await prisma.user.count({
            where: {
                createdAt: { gte: startOfMonth }
            }
        });

        // Calculate active students (with recent activity)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeStudents = await prisma.student.count({
            where: {
                applications: {
                    some: {
                        appliedAt: { gte: thirtyDaysAgo }
                    }
                }
            }
        });

        // Count verified mentors (assuming we add this field later, for now use total)
        const verifiedMentors = mentors;

        return successResponse({
            totalUsers,
            students,
            mentors,
            admins,
            activeInternships: internships,
            totalApplications: applications,
            newUsersThisMonth,
            activeStudents,
            verifiedMentors
        });
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
