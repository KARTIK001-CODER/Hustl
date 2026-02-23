'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MentorUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'MENTOR';
}

interface Stats {
    activeStudents: number;
    feedbackGiven: number;
    averageRating: number;
    impactScore: number;
}

export default function MentorDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<MentorUser | null>(null);
    const [stats, setStats] = useState<Stats>({
        activeStudents: 0,
        feedbackGiven: 0,
        averageRating: 0,
        impactScore: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'MENTOR') {
            router.push('/login');
            return;
        }

        setUser(parsedUser);
        fetchMentorStats(token);
    }, [router]);

    const fetchMentorStats = async (token: string) => {
        try {
            const response = await fetch('/api/mentors/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-lg text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">H</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                HUSTL Mentor
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/mentor/dashboard" className="text-slate-900 font-medium">Dashboard</Link>
                            <Link href="/mentor/students" className="text-slate-600 hover:text-slate-900">Students</Link>
                            <Link href="/mentor/feedback" className="text-slate-600 hover:text-slate-900">Feedback</Link>
                            <Link href="/mentor/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Welcome, {fullName}! 👨🏫
                    </h2>
                    <p className="text-slate-600">
                        Help students succeed in their career journey
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-indigo-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-indigo-600 text-sm font-semibold">Under guidance</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.activeStudents}</h3>
                        <p className="text-sm text-slate-600">Active Students</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-purple-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                            <span className="text-purple-600 text-sm font-semibold">+5 this month</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.feedbackGiven}</h3>
                        <p className="text-sm text-slate-600">Feedback Given</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-blue-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-3 h-3 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.averageRating.toFixed(1)}/5.0</h3>
                        <p className="text-sm text-slate-600">Average Rating</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-green-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">Growing</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.impactScore}</h3>
                        <p className="text-sm text-slate-600">Impact Score</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                        <div className="grid gap-4">
                            <Link href="/mentor/students" className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg hover:shadow-md transition">
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">View My Students</h4>
                                    <p className="text-sm text-slate-600">Review profiles and applications</p>
                                </div>
                            </Link>

                            <Link href="/mentor/feedback" className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">Provide Feedback</h4>
                                    <p className="text-sm text-slate-600">Guide students with structured feedback</p>
                                </div>
                            </Link>

                            <Link href="/mentor/students" className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:shadow-md transition">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">Review Applications</h4>
                                    <p className="text-sm text-slate-600">See recent student applications</p>
                                </div>
                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                    {(stats as any).pendingApplications || 0} pending
                                </span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Provided feedback to Sarah Chen</p>
                                    <p className="text-xs text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">New student assigned: John Doe</p>
                                    <p className="text-xs text-slate-500">5 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Reviewed application for Microsoft</p>
                                    <p className="text-xs text-slate-500">1 day ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
