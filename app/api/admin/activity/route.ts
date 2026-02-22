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

        // Fetch recent activity from different sources
        const recentUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                firstName: true,
                lastName: true,
                createdAt: true,
                role: true
            }
        });

        const recentInternships = await prisma.internship.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { title: true, company: true, createdAt: true }
        });

        const recentApplications = await prisma.application.findMany({
            take: 5,
            orderBy: { appliedAt: 'desc' },
            select: {
                appliedAt: true,
                internship: {
                    select: {
                        company: true,
                        title: true
                    }
                },
                student: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                }
            }
        });

        // Combine and format activity
        const activity = [
            ...recentUsers.map(u => ({
                type: 'user',
                action: `New ${u.role.toLowerCase()} registered: ${u.firstName} ${u.lastName}`,
                timestamp: u.createdAt.toISOString()
            })),
            ...recentInternships.map(i => ({
                type: 'internship',
                action: `Internship posted: ${i.title} at ${i.company}`,
                timestamp: i.createdAt.toISOString()
            })),
            ...recentApplications.map(a => ({
                type: 'application',
                action: `${a.student.user.firstName} ${a.student.user.lastName} applied to ${a.internship.company}`,
                timestamp: a.appliedAt.toISOString()
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        return successResponse(activity);
    } catch (error) {
        console.error('Failed to fetch activity:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
