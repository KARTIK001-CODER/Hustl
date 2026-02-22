import { NextRequest } from 'next/server';
import { UserRole } from '@/lib/types';
import prisma from '@/lib/prisma';
import {
    hashPassword,
    generateToken,
    generateSessionToken,
    getSessionExpiration,
    sanitizeUser,
} from '@/lib/auth';
import { successResponse, errorResponse, handleRouteError } from '@/lib/responseHandler';
import {
    studentSignupSchema,
    mentorSignupSchema,
    adminSignupSchema,
} from '@/lib/validators/schemas';

export async function POST(request: NextRequest) {
    try {
        console.log('📝 Signup request received');
        const body = await request.json();
        const { role } = body;
        console.log(`📝 Processing signup for role: ${role}`);

        // Validate based on role
        let validatedData;
        if (role === UserRole.STUDENT) {
            validatedData = studentSignupSchema.parse(body);
        } else if (role === UserRole.MENTOR) {
            validatedData = mentorSignupSchema.parse(body);
        } else if (role === UserRole.ADMIN) {
            validatedData = adminSignupSchema.parse(body);
        } else {
            return errorResponse('Invalid role', 400);
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            return errorResponse('Email already exists', 409);
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user and role-specific record in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: validatedData.email,
                    password: hashedPassword,
                    firstName: validatedData.firstName,
                    lastName: validatedData.lastName,
                    role: validatedData.role,
                },
            });

            // Create role-specific record
            if (role === UserRole.STUDENT) {
                await tx.student.create({
                    data: {
                        userId: user.id,
                        university: (validatedData as any).university,
                        major: (validatedData as any).major,
                        graduationYear: (validatedData as any).graduationYear,
                        skills: (validatedData as any).skills || [],
                        bio: (validatedData as any).bio,
                    },
                });
            } else if (role === UserRole.MENTOR) {
                await tx.mentor.create({
                    data: {
                        userId: user.id,
                        company: (validatedData as any).company,
                        expertise: (validatedData as any).expertise,
                        yearsExperience: (validatedData as any).yearsExperience,
                        bio: (validatedData as any).bio,
                        linkedinUrl: (validatedData as any).linkedinUrl,
                    },
                });
            } else if (role === UserRole.ADMIN) {
                await tx.admin.create({
                    data: {
                        userId: user.id,
                        organization: (validatedData as any).organization,
                        department: (validatedData as any).department,
                        permissions: (validatedData as any).permissions || [],
                    },
                });
            }

            // Create session
            const sessionToken = generateSessionToken();
            const expiresAt = getSessionExpiration();

            await tx.session.create({
                data: {
                    userId: user.id,
                    token: sessionToken,
                    expiresAt,
                },
            });

            return { user, sessionToken };
        });

        // Generate JWT
        const jwtToken = generateToken({
            userId: result.user.id,
            email: result.user.email,
            role: result.user.role,
        });

        // Return user data and tokens
        const response = successResponse(
            {
                user: sanitizeUser(result.user),
                token: jwtToken,
                sessionToken: result.sessionToken,
            },
            'User registered successfully',
            201
        );

        // Set cookie
        response.cookies.set('auth_token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error: any) {
        console.error('❌ Signup error:', error);
        if (error.name === 'ZodError') {
            return errorResponse(error.errors[0].message, 400);
        }

        // Check if it's a database connection error
        if (error.message && error.message.includes('Database not configured')) {
            return errorResponse(
                'Database is not configured. please visit /setup for instructions.',
                503
            );
        }

        return handleRouteError(error);
    }
}
