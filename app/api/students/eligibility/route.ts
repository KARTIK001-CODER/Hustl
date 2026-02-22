import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';
import { ELIGIBILITY_CONFIG } from '@/config/constants';

// GET - Check student eligibility status
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

        // Get student with test attempts
        const student = await prisma.student.findUnique({
            where: { userId: payload.userId },
            include: {
                testAttemptRecords: {
                    orderBy: { completedAt: 'desc' },
                    include: {
                        test: {
                            select: {
                                title: true,
                                category: true,
                            }
                        }
                    }
                }
            }
        });

        if (!student) {
            return errorResponse('Student not found', HTTP_STATUS.NOT_FOUND);
        }

        // Calculate eligibility data
        const bestAttempt = [...student.testAttemptRecords].sort((a, b) => b.percentage - a.percentage)[0];
        const canRetake = student.testAttempts < ELIGIBILITY_CONFIG.maxAttempts;
        const daysSinceLastTest = student.lastTestDate
            ? Math.floor((Date.now() - student.lastTestDate.getTime()) / (1000 * 60 * 60 * 24))
            : null;
        const canTakeTest = !student.lastTestDate || daysSinceLastTest! >= ELIGIBILITY_CONFIG.cooldownDays;

        return successResponse({
            isEligible: student.isEligible,
            eligibilityScore: student.eligibilityScore,
            testAttempts: student.testAttempts,
            maxAttempts: ELIGIBILITY_CONFIG.maxAttempts,
            canRetake,
            canTakeTest,
            daysSinceLastTest,
            nextTestAvailable: canTakeTest ? 'Now' : `In ${ELIGIBILITY_CONFIG.cooldownDays - (daysSinceLastTest || 0)} day(s)`,
            bestScore: bestAttempt?.percentage || 0,
            passedTestIds: student.testAttemptRecords
                .filter(a => a.passed)
                .map(a => a.testId),
            recentAttempts: student.testAttemptRecords.slice(0, 3).map(attempt => ({
                date: attempt.completedAt,
                score: attempt.percentage,
                passed: attempt.passed,
                testTitle: attempt.test.title,
            }))
        });
    } catch (error) {
        console.error('Eligibility check error:', error);
        return errorResponse('Failed to check eligibility', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}
