import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function successResponse<T>(
    data: T,
    message?: string,
    status: number = 200
): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
        },
        { status }
    );
}

export function errorResponse(
    error: string,
    status: number = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
): NextResponse<ApiResponse<T[]>> {
    return NextResponse.json({
        success: true,
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export function handleRouteError(error: any): NextResponse<ApiResponse> {
    console.error('Route error:', error);

    if (error.code === 'P2002') {
        return errorResponse('A record with this data already exists', 409);
    }

    if (error.code === 'P2025') {
        return errorResponse('Record not found', 404);
    }

    return errorResponse(
        error.message || 'Internal server error',
        error.status || 500
    );
}
