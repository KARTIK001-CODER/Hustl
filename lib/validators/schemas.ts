import { z } from 'zod';
import { UserRole, ApplicationStatus, FeedbackSentiment, TestDifficulty } from '../types';

// Auth schemas
export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    role: z.nativeEnum(UserRole),
});

export const studentSignupSchema = signupSchema.extend({
    role: z.literal(UserRole.STUDENT),
    university: z.string().min(1, 'University is required'),
    major: z.string().min(1, 'Major is required'),
    graduationYear: z.number().int().min(2024).max(2030),
    skills: z.array(z.string()).optional().default([]),
    bio: z.string().optional(),
});

export const mentorSignupSchema = signupSchema.extend({
    role: z.literal(UserRole.MENTOR),
    company: z.string().min(1, 'Company is required'),
    expertise: z.array(z.string()).min(1, 'At least one expertise is required'),
    yearsExperience: z.number().int().min(0),
    bio: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
});

export const adminSignupSchema = signupSchema.extend({
    role: z.literal(UserRole.ADMIN),
    organization: z.string().min(1, 'Organization is required'),
    department: z.string().min(1, 'Department is required'),
    permissions: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// User update schemas
export const updateUserSchema = z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
});

export const updateStudentProfileSchema = z.object({
    university: z.string().optional(),
    major: z.string().optional(),
    graduationYear: z.number().int().min(2024).max(2030).optional(),
    skills: z.array(z.string()).optional(),
    bio: z.string().optional(),
    resumeUrl: z.string().url().optional(),
});

export const updateMentorProfileSchema = z.object({
    company: z.string().optional(),
    expertise: z.array(z.string()).optional(),
    yearsExperience: z.number().int().min(0).optional(),
    bio: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
});

// Internship schemas
export const createInternshipSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    company: z.string().min(1, 'Company is required'),
    description: z.string().min(1, 'Description is required'),
    requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
    location: z.string().min(1, 'Location is required'),
    type: z.enum(['Remote', 'Hybrid', 'On-site']),
    duration: z.string().min(1, 'Duration is required'),
    stipend: z.string().optional(),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    testId: z.string().cuid().optional(),
    applicationDeadline: z.string().optional(),
    startDate: z.string().optional(),
});

export const updateInternshipSchema = createInternshipSchema.partial();

// Application schemas
export const createApplicationSchema = z.object({
    internshipId: z.string().cuid(),
    coverLetter: z.string().optional(),
    resumeUrl: z.string().url().optional(),
});

export const updateApplicationSchema = z.object({
    status: z.nativeEnum(ApplicationStatus),
});

// Feedback schemas
export const createFeedbackSchema = z.object({
    studentId: z.string().cuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, 'Comment is required'),
    sentiment: z.nativeEnum(FeedbackSentiment).optional().default(FeedbackSentiment.NEUTRAL),
    actionItems: z.array(z.string()).optional().default([]),
});

// Test schemas
export const createTestSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    category: z.string().min(1, 'Category is required'),
    difficulty: z.nativeEnum(TestDifficulty),
    duration: z.number().int().min(1),
    passingScore: z.number().int().min(0).max(100),
    questions: z.array(z.any()),
});

export const submitTestAttemptSchema = z.object({
    testId: z.string().cuid(),
    answers: z.array(z.any()),
});

// Pagination schema
export const paginationSchema = z.object({
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(10),
});
