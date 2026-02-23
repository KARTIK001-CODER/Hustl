import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import { HTTP_STATUS } from '@/config/constants';

export const runtime = 'nodejs';

// GET - Fetch specific internship details
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

        const internship = await prisma.internship.findUnique({
            where: { id },
            include: {
                test: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        passingScore: true,
                    }
                }
            }
        });

        if (!internship) {
            return errorResponse('Internship not found', HTTP_STATUS.NOT_FOUND);
        }

        return successResponse(internship);
    } catch (error) {
        return handleRouteError(error);
    }
}
