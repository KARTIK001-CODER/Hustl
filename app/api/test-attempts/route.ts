import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';
import { ELIGIBILITY_CONFIG } from '@/config/constants';
import { UserRole } from '@/lib/types';

export const runtime = 'nodejs';

// GET - Get student's test attempts
export async function GET(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== UserRole.STUDENT) {
            return errorResponse('Forbidden', HTTP_STATUS.FORBIDDEN);
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId },
            include: {
                testAttemptRecords: {
                    include: {
                        test: {
                            select: {
                                title: true,
                                category: true,
                                difficulty: true,
                            }
                        }
                    },
                    orderBy: { completedAt: 'desc' }
                }
            }
        });

        if (!student) {
            return errorResponse('Student not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(student.testAttemptRecords);
    } catch (error) {
        return handleRouteError(error);
    }
}

// POST - Submit test attempt (UPDATED WITH ELIGIBILITY GRANT)
export async function POST(request: NextRequest) {
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload || payload.role !== UserRole.STUDENT) {
            return errorResponse('Only students can submit tests', HTTP_STATUS.FORBIDDEN);
        }

        const student = await prisma.student.findUnique({
            where: { userId: payload.userId },
        });

        if (!student) {
            return errorResponse('Student not found', HTTP_STATUS.NOT_FOUND);
        }

        // Check attempt limits
        if (student.testAttempts >= ELIGIBILITY_CONFIG.maxAttempts) {
            return errorResponse(
                `Maximum attempts (${ELIGIBILITY_CONFIG.maxAttempts}) reached. Please contact support.`,
                HTTP_STATUS.FORBIDDEN
            );
        }

        // Check cooldown period
        if (student.lastTestDate) {
            const daysSinceLastTest = Math.floor(
                (Date.now() - student.lastTestDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastTest < ELIGIBILITY_CONFIG.cooldownDays) {
                return errorResponse(
                    `Please wait ${ELIGIBILITY_CONFIG.cooldownDays - daysSinceLastTest} more day(s) before retaking the test.`,
                    HTTP_STATUS.FORBIDDEN
                );
            }
        }

        const body = await request.json();
        const { testId, answers, timeSpent } = body;

        if (!testId || !answers) {
            return errorResponse('Test ID and answers are required', HTTP_STATUS.BAD_REQUEST);
        }

        // Get test details
        const test = await prisma.test.findUnique({
            where: { id: testId },
        });

        if (!test) {
            return errorResponse('Test not found', HTTP_STATUS.NOT_FOUND);
        }

        // Calculate score
        const { score, maxScore } = calculateScore(answers, test.questions);
        const percentage = (score / maxScore) * 100;
        const passed = percentage >= ELIGIBILITY_CONFIG.passingScore;

        // Create test attempt
        const attempt = await prisma.testAttempt.create({
            data: {
                studentId: student.id,
                testId,
                score,
                maxScore,
                percentage,
                passed,
                timeSpent: timeSpent || 0,
                answers,
                completedAt: new Date(),
                grantedEligibility: passed,
            },
        });

        // ⭐ UPDATE STUDENT ELIGIBILITY IF PASSED
        if (passed) {
            await prisma.student.update({
                where: { id: student.id },
                data: {
                    isEligible: true,
                    eligibilityScore: Math.round(percentage),
                    lastTestDate: new Date(),
                    testAttempts: { increment: 1 },
                },
            });
        } else {
            // Just update attempt count and last test date
            await prisma.student.update({
                where: { id: student.id },
                data: {
                    lastTestDate: new Date(),
                    testAttempts: { increment: 1 },
                },
            });
        }

        return successResponse(
            {
                attempt,
                message: passed
                    ? '🎉 Congratulations! You passed and are now eligible to apply for internships!'
                    : `You scored ${percentage.toFixed(1)}%. You need ${ELIGIBILITY_CONFIG.passingScore}% to become eligible. Please try again.`,
                passed,
                percentage,
                eligibilityGranted: passed,
                attemptsRemaining: ELIGIBILITY_CONFIG.maxAttempts - student.testAttempts - 1,
            },
            'Test submitted successfully',
            HTTP_STATUS.CREATED
        );
    } catch (error) {
        return handleRouteError(error);
    }
}

// Helper function to calculate score
function calculateScore(answers: any, questions: any): { score: number; maxScore: number } {
    if (!Array.isArray(questions)) {
        return { score: 0, maxScore: 0 };
    }

    let score = 0;
    const maxScore = questions.length * 10; // 10 points per question

    questions.forEach((question: any, index: number) => {
        const userAnswer = answers[index] || answers[question.id] || answers[String(index)];

        // Handle both string answers and numeric indices
        let isCorrect = false;
        if (typeof question.correctAnswer === 'number') {
            isCorrect = userAnswer === question.options[question.correctAnswer];
        } else {
            isCorrect = userAnswer === question.correctAnswer;
        }

        if (isCorrect) {
            score += 10;
        }
    });

    return { score, maxScore };
}
