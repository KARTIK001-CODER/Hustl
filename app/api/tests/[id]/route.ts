import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

export const runtime = 'nodejs';

// GET - Fetch specific test details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
) {
    const { id } = await params;
    try {
        const token = extractTokenFromHeader(request.headers.get('authorization'));
        if (!token) {
            return errorResponse('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return errorResponse('Invalid token', HTTP_STATUS.UNAUTHORIZED);
        }

        const test = await prisma.test.findUnique({
            where: { id },
        });

        if (!test) {
            return errorResponse('Test not found', HTTP_STATUS.NOT_FOUND);
        }

        // Mask correct answers in questions
        const questions = test.questions as any[];
        const safeQuestions = questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            type: q.type,
        }));

        return successResponse({
            ...test,
            questions: safeQuestions,
        });
    } catch (error) {
        return handleRouteError(error);
    }
}
