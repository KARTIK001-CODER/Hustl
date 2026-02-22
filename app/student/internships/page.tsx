'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';

interface Internship {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string;
    type: string;
    skills?: string[];
    requirements?: string;
    duration?: string;
    test?: {
        id: string;
        title: string;
    };
}

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

export default function InternshipsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [internships, setInternships] = useState<Internship[]>([]);
    const [passedTests, setPassedTests] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        Promise.all([fetchInternships(), fetchEligibility()]).finally(() => setLoading(false));
    }, [router]);

    const fetchEligibility = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const response = await fetch('/api/students/eligibility', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.data.passedTestIds) {
                setPassedTests(new Set(data.data.passedTestIds));
            }
        } catch (error) {
            console.error('Failed to fetch eligibility:', error);
        }
    };

    const fetchInternships = async () => {
        try {
            const response = await fetch('/api/internships');
            const data = await response.json();

            if (data.success) {
                setInternships(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch internships:', error);
        }
    };


    const handleApplyClick = (internship: Internship) => {
        if (internship.test && !passedTests.has(internship.test.id)) {
            // Redirect to test
            router.push(`/take-test?testId=${internship.test.id}`);
        } else {
            // Apply logic (existing)
            router.push(`/applications/new?internshipId=${internship.id}`);
        }
    };

    const filteredInternships = internships.filter(internship =>
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-bold text-hustl-charcoal tracking-tight">Loading opportunities...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            {/* Navigation */}
            <StudentNavbar user={user} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-hustl-charcoal mb-3 tracking-tight">Browse Roles 🔍</h1>
                    <p className="text-slate-500 text-xl font-medium">Discover opportunities that align with your career goals</p>
                </div>

                {/* Search Bar */}
                <div className="mb-12">
                    <div className="relative max-w-2xl group">
                        <input
                            type="text"
                            placeholder="Search by title, company, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-8 py-5 pl-14 bg-white border-2 border-gray-100 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal/50 transition-all font-medium text-lg shadow-sm"
                        />
                        <svg
                            className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-hustl-teal transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Empty State */}
                {!loading && filteredInternships.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="h-12 w-12 text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-2xl font-black text-hustl-charcoal mb-4">No matching roles</p>
                        <p className="text-slate-400 font-medium mb-8">Try adjusting your search filters</p>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-8 py-4 bg-hustl-teal text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Internship Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredInternships.map((internship) => {
                        const hasTest = !!internship.test;
                        const isEligible = !hasTest || passedTests.has(internship.test!.id);

                        return (
                            <div
                                key={internship.id}
                                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 bg-hustl-sandstone rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="text-hustl-teal font-black text-2xl">
                                            {internship.company.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                                            {internship.type}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-hustl-charcoal mb-2 tracking-tight line-clamp-2">
                                        {internship.title}
                                    </h3>
                                    <p className="text-hustl-terracotta font-bold text-lg mb-4">
                                        {internship.company}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-6">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="uppercase tracking-wide">{internship.location}</span>
                                    </div>

                                    <p className="text-slate-600 font-medium mb-8 line-clamp-3 leading-relaxed">
                                        {internship.description}
                                    </p>

                                    {internship.skills && internship.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-10">
                                            {internship.skills.slice(0, 3).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-4 py-1.5 bg-hustl-teal/5 text-hustl-teal text-[10px] font-black uppercase tracking-widest rounded-lg"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {internship.skills.length > 3 && (
                                                <span className="px-4 py-1.5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                                    +{internship.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleApplyClick(internship)}
                                    className={`w-full font-black py-5 rounded-2xl transition-all duration-300 shadow-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${isEligible
                                        ? 'bg-hustl-teal text-white hover:bg-hustl-teal/90 hover:shadow-hustl-teal/20'
                                        : 'bg-hustl-terracotta text-white hover:bg-hustl-terracotta/90 hover:shadow-hustl-terracotta/20'
                                        }`}
                                >
                                    {isEligible ? (
                                        <>
                                            Apply Now
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </>
                                    ) : 'Enroll in Assessment'}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    );
}
