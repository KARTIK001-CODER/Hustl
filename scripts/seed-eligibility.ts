import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed...');

    // Create a Frontend Test
    const frontendTest = await prisma.test.create({
        data: {
            title: 'Frontend Development Assessment',
            description: 'Evaluate your knowledge of React, TypeScript, and modern CSS.',
            category: 'Frontend',
            difficulty: 'INTERMEDIATE',
            duration: 30, // minutes
            passingScore: 70,
            questions: [
                {
                    id: 'q1',
                    text: 'What is the correct way to update state based on previous state in React?',
                    type: 'single_choice',
                    options: ['setState(newState)', 'setState(prev => newState)', 'state = newState', 'None of the above'],
                    correctAnswer: 'setState(prev => newState)'
                },
                {
                    id: 'q2',
                    text: 'Which hook corresponds to componentDidMount?',
                    type: 'single_choice',
                    options: ['useEffect(() => {}, [])', 'useEffect(() => {})', 'useLayoutEffect', 'useMemo'],
                    correctAnswer: 'useEffect(() => {}, [])'
                },
                // Add more questions as needed
            ]
        }
    });

    console.log('Created Frontend Test:', frontendTest.title);

    // Link test to an internship (assuming one exists or create new)
    // Let's create a new internship for demo
    const internship = await prisma.internship.create({
        data: {
            title: 'React Frontend Intern',
            company: 'TechCorp Inc.',
            description: 'We are looking for a passionate React developer intern.',
            location: 'Remote',
            type: 'Full-time',
            duration: '3 months',
            requirements: ['React', 'TypeScript', 'Git'],
            skills: ['React', 'Typescript', 'Tailwind'],
            stipend: '$2000/month',
            testId: frontendTest.id // Link the test!
        }
    });

    console.log('Created Internship linked to test:', internship.title);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
