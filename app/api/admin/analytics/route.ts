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

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get('days') || '30');

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

        // Current period stats
        const [currentUsers, currentApps, currentFeedback] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: startDate } } }),
            prisma.application.count({ where: { appliedAt: { gte: startDate } } }),
            prisma.feedback.count({ where: { createdAt: { gte: startDate } } })
        ]);

        // Previous period stats
        const [previousUsers, previousApps, previousFeedback] = await Promise.all([
            prisma.user.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
            prisma.application.count({ where: { appliedAt: { gte: previousStartDate, lt: startDate } } }),
            prisma.feedback.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } })
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        // Calculate conversion rate (offers / applications)
        const offers = await prisma.application.count({
            where: { status: 'OFFER', appliedAt: { gte: startDate } }
        });
        const conversionRate = currentApps > 0 ? Number(((offers / currentApps) * 100).toFixed(1)) : 0;

        const previousOffers = await prisma.application.count({
            where: { status: 'OFFER', appliedAt: { gte: previousStartDate, lt: startDate } }
        });
        const previousConversionRate = previousApps > 0 ? Number(((previousOffers / previousApps) * 100).toFixed(1)) : 0;

        return successResponse({
            totalUsers: {
                value: currentUsers,
                growth: calculateGrowth(currentUsers, previousUsers)
            },
            activeApplications: {
                value: currentApps,
                growth: calculateGrowth(currentApps, previousApps)
            },
            feedbackGiven: {
                value: currentFeedback,
                growth: calculateGrowth(currentFeedback, previousFeedback)
            },
            conversionRate: {
                value: conversionRate,
                growth: Number((conversionRate - previousConversionRate).toFixed(1))
            }
        });
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
