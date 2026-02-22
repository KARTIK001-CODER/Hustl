'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';
import {
    FileText,
    CheckCircle,
    Clock,
    Award,
    BookOpen,
    Send,
    User,
    MessageSquare,
    AlertCircle,
    TrendingUp,
    ChevronRight,
    Star,
    Info,
    LogOut,
    Zap
} from 'lucide-react';

// Types
interface TestAttempt {
    id: string;
    internshipId: string;
    status: 'not_attempted' | 'passed' | 'failed';
    score?: number;
    attemptCount: number;
    maxAttempts: number;
    lastAttemptDate?: string;
}

interface Internship {
    id: string;
    title: string;
    company: string;
    minimumScore: number;
    testRequired: boolean;
    testAttempt?: TestAttempt;
    canRetake: boolean;
}

interface Application {
    id: string;
    internshipTitle: string;
    company: string;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'technical';
    testStatus: 'passed' | 'failed' | 'not_required';
    lastUpdated: string;
}

interface Feedback {
    id: string;
    mentorName: string;
    internshipContext: string;
    rating: number;
    snippet: string;
    date: string;
}

interface Stats {
    appliedInternships: number;
    testsPassed: number;
    testsPending: number;
    offersReceived: number;
}

export default function StudentDashboard() {
    const router = useRouter();
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [selectedTooltip, setSelectedTooltip] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<Stats>({
        appliedInternships: 0,
        testsPassed: 0,
        testsPending: 0,
        offersReceived: 0
    });

    const [internships, setInternships] = useState<Internship[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

    // Auth check and data fetching
    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchDashboardData(token);
    }, [router]);

    const fetchDashboardData = async (token: string) => {
        try {
            setLoading(true);

            // Fetch all required data in parallel
            const [appsRes, internshipsRes, feedbackRes, eligibilityRes] = await Promise.all([
                fetch('/api/applications', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/internships', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/feedback', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/students/eligibility', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const appsData = await appsRes.json();
            const internshipsData = await internshipsRes.json();
            const feedbackData = await feedbackRes.json();
            const eligibilityData = await eligibilityRes.json();

            if (appsData.success && internshipsData.success && feedbackData.success && eligibilityData.success) {
                // Map Applications
                const mappedApps = appsData.data.map((app: any) => {
                    const hasTest = !!app.internship.testId;
                    const isPassed = hasTest && eligibilityData.data.passedTestIds?.includes(app.internship.testId);

                    return {
                        id: app.id,
                        internshipTitle: app.internship.title,
                        company: app.internship.company,
                        status: app.status.toLowerCase(),
                        testStatus: hasTest ? (isPassed ? 'passed' : 'failed') : 'not_required',
                        lastUpdated: app.updatedAt
                    };
                });
                setApplications(mappedApps);

                // Map Feedback
                const mappedFeedback = feedbackData.data.slice(0, 3).map((f: any) => ({
                    id: f.id,
                    mentorName: `${f.mentor.user.firstName} ${f.mentor.user.lastName}`,
                    internshipContext: f.comment.substring(0, 50) + '...', // Context isn't explicitly in DB
                    rating: f.rating,
                    snippet: f.comment,
                    date: f.createdAt
                }));
                setFeedbacks(mappedFeedback);

                // Map Internships & Eligibility
                const mappedInternships = internshipsData.data.slice(0, 5).map((inst: any) => {
                    const testAttempt = eligibilityData.data.recentAttempts?.find((a: any) => a.testTitle === inst.test?.title);

                    return {
                        id: inst.id,
                        title: inst.title,
                        company: inst.company,
                        minimumScore: inst.test?.passingScore || 70,
                        testRequired: !!inst.test,
                        testAttempt: inst.test ? {
                            id: inst.test.id,
                            internshipId: inst.id,
                            status: testAttempt ? (testAttempt.passed ? 'passed' : 'failed') : 'not_attempted',
                            score: testAttempt?.score || 0,
                            attemptCount: eligibilityData.data.testAttempts || 0,
                            maxAttempts: eligibilityData.data.maxAttempts || 3,
                            lastAttemptDate: testAttempt?.date
                        } : undefined,
                        canRetake: eligibilityData.data.canRetake
                    };
                });
                setInternships(mappedInternships);

                // Calculate Stats
                const passedTestsCount = eligibilityData.data.passedTestIds?.length || 0;
                const totalTestsNeeded = internshipsData.data.filter((i: any) => i.testId).length;
                const offersCount = appsData.data.filter((app: any) => ['OFFER', 'ACCEPTED'].includes(app.status)).length;

                setStats({
                    appliedInternships: appsData.data.length,
                    testsPassed: passedTestsCount,
                    testsPending: totalTestsNeeded - passedTestsCount > 0 ? totalTestsNeeded - passedTestsCount : 0,
                    offersReceived: offersCount
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };


    // Helper functions
    const getStatusColor = (status: Application['status']) => {
        switch (status) {
            case 'applied': return 'bg-hustl-teal/10 text-hustl-teal';
            case 'screening': return 'bg-hustl-terracotta/10 text-hustl-terracotta';
            case 'interview': return 'bg-amber-100 text-amber-800';
            case 'offer': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-hustl-charcoal/10 text-hustl-charcoal';
            case 'technical': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTestStatusBadge = (test?: TestAttempt) => {
        if (!test || test.status === 'not_attempted') {
            return <span className="px-3 py-1 bg-hustl-terracotta/10 text-hustl-terracotta rounded-full text-sm font-bold">Not Attempted</span>;
        }
        if (test.status === 'passed') {
            return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">Passed ({Math.round(test.score || 0)}%)</span>;
        }
        if (test.status === 'failed') {
            return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">Failed ({Math.round(test.score || 0)}%)</span>;
        }
    };

    const getActionButton = (internship: Internship) => {
        const test = internship.testAttempt;

        if (!test || test.status === 'not_attempted') {
            return (
                <button
                    onClick={() => router.push(`/student/take-test?testId=${test?.id || ''}`)}
                    className="px-6 py-2.5 bg-hustl-teal text-white rounded-xl font-bold hover:bg-hustl-teal/90 transition-all duration-300 shadow-lg hover:shadow-hustl-teal/20"
                >
                    Take Test
                </button>
            );
        }

        if (test.status === 'failed' && internship.canRetake && test.attemptCount < test.maxAttempts) {
            return (
                <button
                    onClick={() => router.push(`/student/take-test?testId=${test.id}`)}
                    className="px-6 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/20"
                >
                    Retake Test ({test.attemptCount}/{test.maxAttempts})
                </button>
            );
        }

        if (test.status === 'passed') {
            return (
                <button
                    onClick={() => router.push(`/student/applications/new?internshipId=${internship.id}`)}
                    className="px-6 py-2.5 bg-hustl-terracotta text-white rounded-xl font-bold hover:bg-hustl-terracotta/90 transition-all duration-300 shadow-lg hover:shadow-hustl-terracotta/20"
                >
                    Apply Now
                </button>
            );
        }

        return (
            <div className="relative group">
                <button
                    disabled
                    className="px-6 py-2.5 bg-gray-200 text-gray-400 rounded-xl font-bold cursor-not-allowed"
                    onMouseEnter={() => setSelectedTooltip(internship.id)}
                    onMouseLeave={() => setSelectedTooltip(null)}
                >
                    Apply Locked
                </button>
                {selectedTooltip === internship.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-hustl-charcoal text-white text-xs rounded-lg shadow-xl whitespace-nowrap z-10">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            <span>Max attempts reached. Contact support.</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-bold text-hustl-charcoal tracking-tight">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const firstName = user.fullName ? user.fullName.split(' ')[0] : (user.firstName || 'Student');

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            {/* Header */}
            <StudentNavbar user={user} />

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-4xl font-black text-hustl-charcoal mb-3 tracking-tight">Welcome back, {firstName}! 🚀</h2>
                    <p className="text-slate-500 text-xl font-medium">Your career journey is evolving. Here's the latest.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { icon: FileText, label: 'Applications', value: stats.appliedInternships, color: 'bg-hustl-teal/5', iconColor: 'text-hustl-teal', link: '/student/applications' },
                        { icon: CheckCircle, label: 'Tests Passed', value: stats.testsPassed, color: 'bg-green-50', iconColor: 'text-green-600', link: '/student/internships' },
                        { icon: Clock, label: 'Pending Tests', value: stats.testsPending, color: 'bg-hustl-terracotta/5', iconColor: 'text-hustl-terracotta', link: '/student/internships' },
                        { icon: Award, label: 'Offers', value: stats.offersReceived, color: 'bg-amber-50', iconColor: 'text-amber-600', link: '/student/applications' }
                    ].map((stat, index) => (
                        <Link
                            key={index}
                            href={stat.link}
                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
                            onMouseEnter={() => setHoveredCard(stat.label)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                                </div>
                                <ChevronRight className={`w-6 h-6 text-slate-300 transition-all duration-300 ${hoveredCard === stat.label ? 'translate-x-1 text-hustl-teal' : ''}`} />
                            </div>
                            <h3 className="text-4xl font-black text-hustl-charcoal mb-1 tracking-tighter">{stat.value}</h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{stat.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Internship Eligibility Tests */}
                        <section id="tests" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-hustl-teal/10 rounded-2xl flex items-center justify-center text-hustl-teal">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-hustl-charcoal tracking-tight">Active Opportunities</h2>
                            </div>

                            <div className="space-y-6">
                                {internships.length > 0 ? internships.map((internship) => {
                                    const isPassed = internship.testAttempt?.status === 'passed';

                                    return (
                                        <div
                                            key={internship.id}
                                            className={`rounded-[2rem] p-8 transition-all duration-300 border ${isPassed
                                                ? 'bg-green-50/30 border-green-100'
                                                : 'bg-white border-gray-100 hover:border-hustl-teal/30 hover:shadow-xl'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex-1">
                                                    <div className="mb-4">
                                                        <h3 className="text-2xl font-bold text-hustl-charcoal mb-2 tracking-tight">{internship.title}</h3>
                                                        <p className="text-slate-500 font-bold text-lg mb-1">{internship.company}</p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-6">
                                                        {getTestStatusBadge(internship.testAttempt)}
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                                            <TrendingUp className="w-4 h-4" />
                                                            <span>Bench: <span className="text-hustl-charcoal">{internship.minimumScore}%</span></span>
                                                        </div>
                                                        {internship.testAttempt?.lastAttemptDate && (
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                                                                Updated: {new Date(internship.testAttempt.lastAttemptDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-3 md:items-end">
                                                    {getActionButton(internship)}
                                                    {isPassed && (
                                                        <div className="flex items-center gap-2 text-green-600 text-sm font-bold uppercase tracking-wider">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>Eligible to apply</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-16 border-4 border-dashed border-slate-100 rounded-[2.5rem]">
                                        <p className="text-slate-400 font-bold text-xl">No active opportunities at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* My Applications */}
                        <section id="applications" className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-hustl-terracotta/10 rounded-2xl flex items-center justify-center text-hustl-terracotta">
                                    <Send className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-black text-hustl-charcoal tracking-tight">Pipeline Control</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-left">
                                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Internship</th>
                                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Company</th>
                                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Test</th>
                                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app) => (
                                            <tr key={app.id} className="group bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                                                <td className="py-6 px-4 first:rounded-l-2xl">
                                                    <p className="font-bold text-hustl-charcoal">{app.internshipTitle}</p>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <p className="text-slate-500 font-bold">{app.company}</p>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-4">
                                                    <span className={`text-sm font-bold ${app.testStatus === 'passed' ? 'text-green-600' :
                                                        app.testStatus === 'failed' ? 'text-hustl-terracotta' :
                                                            'text-slate-400'
                                                        }`}>
                                                        {app.testStatus === 'passed' ? '✓ READY' :
                                                            app.testStatus === 'failed' ? '✗ FAILED' :
                                                                'EXEMPT'}
                                                    </span>
                                                </td>
                                                <td className="py-6 px-4 last:rounded-r-2xl">
                                                    <p className="text-sm font-bold text-slate-400">
                                                        {new Date(app.lastUpdated).toLocaleDateString()}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {applications.length === 0 && (
                                <div className="text-center py-20">
                                    <FileText className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold text-xl mb-8">Your pipeline is empty.</p>
                                    <Link
                                        href="/student/internships"
                                        className="px-10 py-5 bg-hustl-teal text-white rounded-2xl font-bold text-lg hover:bg-hustl-teal/90 transition-all shadow-lg"
                                    >
                                        Find Your Next Role
                                    </Link>
                                </div>
                            )}
                        </section>

                        {/* Mentor Feedback */}
                        <section className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-3xl font-black text-hustl-charcoal tracking-tight">Growth Insights</h2>
                                </div>
                                <Link href="/student/feedback" className="text-hustl-teal hover:text-hustl-teal/80 font-bold text-sm flex items-center gap-2 transition-colors uppercase tracking-widest">
                                    View Repository
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid md:grid-cols-1 gap-6">
                                {feedbacks.map((feedback) => (
                                    <div key={feedback.id} className="bg-slate-50/30 border border-gray-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl transition-all duration-500">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-hustl-teal rounded-full flex items-center justify-center text-white font-black text-xl">
                                                    {feedback.mentorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-hustl-charcoal text-lg">{feedback.mentorName}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{feedback.internshipContext}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm">
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                <span className="text-sm font-black text-hustl-charcoal">{feedback.rating}</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 font-medium leading-relaxed mb-6 italic">"{feedback.snippet}"</p>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                            <span className="text-xs font-bold text-slate-300 uppercase letter tracking-widest">{new Date(feedback.date).toLocaleDateString()}</span>
                                            <Link href="/student/feedback" className="text-hustl-teal hover:underline text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                                                Full Insight
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {feedbacks.length === 0 && (
                                <div className="text-center py-20">
                                    <Zap className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold text-xl">Waiting for mentor insights.</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Quick Actions */}
                    <div className="lg:col-span-1">
                        <div className="space-y-8 sticky top-32">
                            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-black text-hustl-charcoal mb-8 tracking-tight">Quick Access</h2>

                                <div className="space-y-4">
                                    <Link href="/student/internships" className="w-full px-8 py-5 bg-hustl-teal text-white rounded-[1.25rem] font-bold hover:shadow-2xl hover:bg-hustl-teal/95 transition-all flex items-center justify-between group">
                                        <span>Browse Roles</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link href="/student/internships?tab=tests" className="w-full px-8 py-5 bg-white border-2 border-hustl-teal/20 text-hustl-teal rounded-[1.25rem] font-bold hover:border-hustl-teal hover:bg-hustl-teal/5 transition-all flex items-center justify-between group">
                                        <span>Test Center</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    <Link href="/student/profile" className="w-full px-8 py-5 bg-white border border-slate-100 text-slate-500 rounded-[1.25rem] font-bold hover:border-hustl-terracotta hover:text-hustl-terracotta hover:bg-hustl-terracotta/5 transition-all flex items-center justify-between group">
                                        <span>User Settings</span>
                                        <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </Link>
                                </div>

                                {/* Progress Ring */}
                                <div className="mt-12 pt-12 border-t border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Career Readiness</h3>
                                    <div className="flex items-center justify-center relative">
                                        <div className="relative w-40 h-40">
                                            <svg className="transform -rotate-90 w-40 h-40">
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke="#F8FAFC"
                                                    strokeWidth="12"
                                                    fill="none"
                                                />
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke="#D96C50"
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray={`${((stats.testsPassed / (stats.testsPassed + stats.testsPending || 1)) * 439.8)} 439.8`}
                                                    className="transition-all duration-1000"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-3xl font-black text-hustl-charcoal tracking-tighter">
                                                    {Math.round((stats.testsPassed / (stats.testsPassed + stats.testsPending || 1)) * 100)}%
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-center text-sm font-bold text-slate-500 mt-8">
                                        <span className="text-hustl-terracotta">{stats.testsPassed}</span> of <span className="text-hustl-charcoal">{stats.testsPassed + stats.testsPending}</span> milestones reached
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
