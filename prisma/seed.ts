import { PrismaClient, UserRole, ApplicationStatus, FeedbackSentiment, TestDifficulty } from '@prisma/client';
// import { UserRole, ApplicationStatus, FeedbackSentiment, TestDifficulty } from '../lib/types';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
// const prisma: any = null; // Will be available after database setup

async function main() {
    console.log('🌱 Starting database seed...');

    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create Students
    console.log('Creating students...');
    const student1 = await prisma.user.create({
        data: {
            email: 'sarah.chen@stanford.edu',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Chen',
            role: UserRole.STUDENT,
            student: {
                create: {
                    university: 'Stanford University',
                    major: 'Computer Science',
                    graduationYear: 2025,
                    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
                    bio: 'Passionate about full-stack development and AI',
                },
            },
        },
        include: {
            student: true,
        },
    });

    const student2 = await prisma.user.create({
        data: {
            email: 'alex.kumar@mit.edu',
            password: hashedPassword,
            firstName: 'Alex',
            lastName: 'Kumar',
            role: UserRole.STUDENT,
            student: {
                create: {
                    university: 'MIT',
                    major: 'Data Science',
                    graduationYear: 2026,
                    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
                    bio: 'Interested in machine learning and data analytics',
                },
            },
        },
        include: {
            student: true,
        },
    });

    // Create Mentors
    console.log('Creating mentors...');
    const mentor1 = await prisma.user.create({
        data: {
            email: 'james.wilson@google.com',
            password: hashedPassword,
            firstName: 'James',
            lastName: 'Wilson',
            role: UserRole.MENTOR,
            mentor: {
                create: {
                    company: 'Google',
                    expertise: ['Software Engineering', 'System Design', 'Cloud Architecture'],
                    yearsExperience: 8,
                    bio: 'Senior Software Engineer at Google, passionate about mentoring',
                    linkedinUrl: 'https://linkedin.com/in/jameswilson',
                },
            },
        },
        include: {
            mentor: true,
        },
    });

    const mentor2 = await prisma.user.create({
        data: {
            email: 'emily.rodriguez@microsoft.com',
            password: hashedPassword,
            firstName: 'Emily',
            lastName: 'Rodriguez',
            role: UserRole.MENTOR,
            mentor: {
                create: {
                    company: 'Microsoft',
                    expertise: ['Product Management', 'Agile', 'User Research'],
                    yearsExperience: 6,
                    bio: 'Product Manager helping students break into tech',
                },
            },
        },
        include: {
            mentor: true,
        },
    });

    // Create Admin
    console.log('Creating admin...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@hustl.app',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            admin: {
                create: {
                    organization: 'HUSTL',
                    department: 'Platform Operations',
                    permissions: ['manage_users', 'manage_internships', 'view_analytics'],
                },
            },
        },
        include: {
            admin: true,
        },
    });

    // Create Internships
    console.log('Creating internships...');
    const internship1 = await prisma.internship.create({
        data: {
            title: 'Software Engineer Intern',
            company: 'Google',
            description: 'Join our team to work on cutting-edge technologies and solve complex problems at scale.',
            requirements: [
                'Currently pursuing a degree in Computer Science or related field',
                'Strong programming skills in Java, C++, or Python',
                'Understanding of data structures and algorithms',
            ],
            location: 'Mountain View, CA',
            type: 'Hybrid',
            duration: '12 weeks',
            stipend: '$8,000/month',
            skills: ['Java', 'Python', 'Algorithms', 'System Design'],
            applicationDeadline: new Date('2026-03-31'),
            startDate: new Date('2026-06-01'),
        },
    });

    const internship2 = await prisma.internship.create({
        data: {
            title: 'Data Science Intern',
            company: 'Microsoft',
            description: 'Work with our data science team to build ML models and analyze large datasets.',
            requirements: [
                'Strong background in statistics and mathematics',
                'Experience with Python and ML libraries',
                'Excellent analytical and problem-solving skills',
            ],
            location: 'Redmond, WA',
            type: 'Remote',
            duration: '10 weeks',
            stipend: '$7,500/month',
            skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
            applicationDeadline: new Date('2026-04-15'),
            startDate: new Date('2026-06-15'),
        },
    });

    const internship3 = await prisma.internship.create({
        data: {
            title: 'Frontend Developer Intern',
            company: 'Meta',
            description: 'Build beautiful and responsive user interfaces for millions of users.',
            requirements: [
                'Proficiency in React and modern JavaScript',
                'Understanding of HTML, CSS, and responsive design',
                'Portfolio of web projects',
            ],
            location: 'Menlo Park, CA',
            type: 'On-site',
            duration: '12 weeks',
            stipend: '$8,500/month',
            skills: ['React', 'JavaScript', 'CSS', 'TypeScript'],
            applicationDeadline: new Date('2026-04-01'),
            startDate: new Date('2026-06-01'),
        },
    });

    // Create Applications
    console.log('Creating applications...');
    const application1 = await prisma.application.create({
        data: {
            studentId: student1.student!.id,
            internshipId: internship1.id,
            status: ApplicationStatus.INTERVIEW,
            coverLetter: 'I am very excited about this opportunity...',
        },
    });

    const application2 = await prisma.application.create({
        data: {
            studentId: student1.student!.id,
            internshipId: internship3.id,
            status: ApplicationStatus.APPLIED,
            coverLetter: 'My passion for frontend development...',
        },
    });

    const application3 = await prisma.application.create({
        data: {
            studentId: student2.student!.id,
            internshipId: internship2.id,
            status: ApplicationStatus.TECHNICAL,
            coverLetter: 'With my background in data science...',
        },
    });

    // Create Feedback
    console.log('Creating feedback...');
    await prisma.feedback.create({
        data: {
            studentId: student1.student!.id,
            mentorId: mentor1.mentor!.id,
            rating: 5,
            comment: 'Excellent work on your coding challenge! Your solution was clean and efficient.',
            sentiment: FeedbackSentiment.POSITIVE,
            actionItems: [
                'Continue practicing system design',
                'Work on communication skills for interviews',
                'Build a portfolio project showcasing your skills',
            ],
        },
    });

    await prisma.feedback.create({
        data: {
            studentId: student2.student!.id,
            mentorId: mentor2.mentor!.id,
            rating: 4,
            comment: 'Great progress! Focus on explaining your thought process more clearly.',
            sentiment: FeedbackSentiment.CONSTRUCTIVE,
            actionItems: [
                'Practice mock interviews',
                'Improve resume formatting',
                'Add more quantifiable achievements',
            ],
        },
    });

    // Create Tests
    console.log('Creating tests...');
    const test1 = await prisma.test.create({
        data: {
            title: 'JavaScript Fundamentals',
            description: 'Test your knowledge of core JavaScript concepts',
            category: 'Programming',
            difficulty: TestDifficulty.BEGINNER,
            duration: 30,
            passingScore: 70,
            questions: [
                {
                    question: 'What is the output of typeof null?',
                    options: ['null', 'undefined', 'object', 'number'],
                    correctAnswer: 2,
                },
                {
                    question: 'Which method is used to add elements to the end of an array?',
                    options: ['push()', 'pop()', 'shift()', 'unshift()'],
                    correctAnswer: 0,
                },
            ],
        },
    });

    // Create Test Attempts
    console.log('Creating test attempts...');
    await prisma.testAttempt.create({
        data: {
            studentId: student1.student!.id,
            testId: test1.id,
            score: 85,
            maxScore: 100,
            percentage: 85.0,
            passed: true,
            answers: [2, 0],
            timeSpent: 1200,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Test Accounts:');
    console.log('Student: sarah.chen@stanford.edu / password123');
    console.log('Student: alex.kumar@mit.edu / password123');
    console.log('Mentor: james.wilson@google.com / password123');
    console.log('Mentor: emily.rodriguez@microsoft.com / password123');
    console.log('Admin: admin@hustl.app / password123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
