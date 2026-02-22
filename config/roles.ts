import { UserRole } from '../lib/types';

export const ROLE_PERMISSIONS = {
    [UserRole.STUDENT]: {
        canViewInternships: true,
        canApplyToInternships: true,
        canViewOwnApplications: true,
        canViewOwnFeedback: true,
        canTakeTests: true,
    },
    [UserRole.MENTOR]: {
        canViewStudents: true,
        canProvideFeedback: true,
        canViewFeedback: true,
    },
    [UserRole.ADMIN]: {
        canManageUsers: true,
        canManageInternships: true,
        canViewAllApplications: true,
        canViewAllFeedback: true,
        canManageTests: true,
        canViewAnalytics: true,
    },
};

export const PROTECTED_ROUTES = {
    public: ['/', '/login', '/signup'],
    student: ['/dashboard', '/internships', '/applications', '/feedback', '/profile'],
    mentor: ['/dashboard', '/students', '/feedback', '/profile'],
    admin: ['/dashboard', '/users', '/internships', '/analytics'],
};

export const ROLE_REDIRECTS = {
    [UserRole.STUDENT]: '/dashboard',
    [UserRole.MENTOR]: '/dashboard',
    [UserRole.ADMIN]: '/dashboard',
};
