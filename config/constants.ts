export const APP_CONFIG = {
    name: 'HUSTL',
    tagline: 'Stop juggling tabs. Start hustling smart.',
    description: 'Unified Internship and Mentorship Platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const AUTH_CONFIG = {
    jwtExpiration: '7d',
    sessionExpiration: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    passwordMinLength: 8,
    saltRounds: 12,
};

export const PAGINATION = {
    defaultPage: 1,
    defaultLimit: 10,
    maxLimit: 100,
};

export const FILE_UPLOAD = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
};

export const APPLICATION_STATUS = {
    APPLIED: 'Applied',
    SCREENING: 'Screening',
    INTERVIEW: 'Interview',
    TECHNICAL: 'Technical Round',
    OFFER: 'Offer Received',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    WITHDRAWN: 'Withdrawn',
};

export const TEST_CONFIG = {
    minDuration: 5, // minutes
    maxDuration: 180, // minutes
    passingScoreDefault: 70, // percentage
};

export const ELIGIBILITY_CONFIG = {
    passingScore: 70,
    maxAttempts: 3,
    cooldownDays: 1,
    testDurationMinutes: 30,
};

export const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
};

export const REDIS_KEYS = {
    userSession: (userId: string) => `session:${userId}`,
    internshipList: 'internships:list',
    applicationStats: (studentId: string) => `stats:applications:${studentId}`,
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'You do not have permission to perform this action',
    NOT_FOUND: 'Resource not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already exists',
    INTERNAL_ERROR: 'Internal server error',
    VALIDATION_ERROR: 'Validation error',
};
