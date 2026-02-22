import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/responseHandler';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        // 1. Create Tests
        const frontendTest = await prisma.test.create({
            data: {
                title: 'Frontend React Assessment',
                description: 'Validate your proficiency in React, Hooks, and Component Lifecycle.',
                category: 'Development',
                difficulty: 'INTERMEDIATE',
                duration: 20,
                passingScore: 70,
                questions: [
                    { id: 'q1', text: 'Which hook is used for side effects?', type: 'single_choice', options: ['useEffect', 'useState', 'useMemo'], correctAnswer: 'useEffect' },
                    { id: 'q2', text: 'How do you pass data to a child component?', type: 'single_choice', options: ['State', 'Props', 'Redux'], correctAnswer: 'Props' },
                    { id: 'q3', text: 'What is the Virtual DOM?', type: 'single_choice', options: ['A direct copy of the DOM', 'A lightweight copy of the DOM', 'A database'], correctAnswer: 'A lightweight copy of the DOM' }
                ]
            }
        });

        const backendTest = await prisma.test.create({
            data: {
                title: 'Node.js Backend Challenge',
                description: 'Test your knowledge of Node.js, Express, and REST APIs.',
                category: 'Development',
                difficulty: 'ADVANCED',
                duration: 30,
                passingScore: 75,
                questions: [
                    { id: 'q1', text: 'What is the event loop?', type: 'single_choice', options: ['A loop that handles async callbacks', 'A for loop', 'A database query'], correctAnswer: 'A loop that handles async callbacks' },
                    { id: 'q2', text: 'Which module is used for file system operations?', type: 'single_choice', options: ['fs', 'http', 'path'], correctAnswer: 'fs' },
                    { id: 'q3', text: 'What does REST stand for?', type: 'single_choice', options: ['Representational State Transfer', 'Remote State Transfer', 'Real State Transfer'], correctAnswer: 'Representational State Transfer' }
                ]
            }
        });

        // 2. Create Internships linked to tests
        await prisma.internship.create({
            data: {
                title: 'Frontend React Intern',
                company: 'Vercel',
                description: 'Join the team building the next generation of web tools. Need strong React skills.',
                location: 'Remote',
                type: 'Internship',
                duration: '3 Months',
                stipend: '$2000/mo',
                skills: ['React', 'Next.js', 'Typescript'],
                requirements: ['React proficiency', 'Git knowledge'],
                testId: frontendTest.id
            }
        });

        await prisma.internship.create({
            data: {
                title: 'Backend Node.js Developer',
                company: 'Netflix',
                description: 'Help us scale our backend services. Node.js expertise required.',
                location: 'San Francisco, CA',
                type: 'Internship',
                duration: '6 Months',
                stipend: '$3500/mo',
                skills: ['Node.js', 'Express', 'MongoDB'],
                requirements: ['Node.js experience', 'API design'],
                testId: backendTest.id
            }
        });

        // 3. Create an open internship (no test)
        await prisma.internship.create({
            data: {
                title: 'Product Design Intern',
                company: 'Airbnb',
                description: 'Design beautiful interfaces for millions of users.',
                location: 'New York, NY',
                type: 'Internship',
                duration: '3 Months',
                stipend: '$3000/mo',
                skills: ['Figma', 'UI/UX', 'Prototyping'],
                requirements: ['Portfolio required']
                // No testId
            }
        });

        return successResponse({ message: 'Seeding completed successfully' });
    } catch (error) {
        console.error('Seeding failed:', error);
        return errorResponse('Failed to seed database', 500);
    }
}
