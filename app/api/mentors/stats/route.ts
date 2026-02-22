import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

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
                    select: {
                        rating: true,
                        studentId: true,
                    }
                }
            }
        });

        if (!mentor) {
            return errorResponse('Mentor not found', HTTP_STATUS.NOT_FOUND);
        }

        // Calculate stats
        const uniqueStudents = new Set(mentor.feedbackGiven.map(f => f.studentId));
        const totalFeedback = mentor.feedbackGiven.length;
        const averageRating = totalFeedback > 0
            ? mentor.feedbackGiven.reduce((sum, f) => sum + f.rating, 0) / totalFeedback
            : 0;

        return successResponse({
            activeStudents: uniqueStudents.size,
            feedbackGiven: totalFeedback,
            averageRating: Number(averageRating.toFixed(1)),
            impactScore: uniqueStudents.size * 10 + totalFeedback * 5
        });
    } catch (error) {
        console.error('Failed to fetch mentor stats:', error);
        return errorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
