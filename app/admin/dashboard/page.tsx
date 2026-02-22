'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN';
}

interface PlatformStats {
    totalUsers: number;
    students: number;
    mentors: number;
    admins: number;
    activeInternships: number;
    totalApplications: number;
    newUsersThisMonth: number;
    activeStudents: number;
    verifiedMentors: number;
}

interface SystemHealth {
    database: 'online' | 'offline';
    api: 'online' | 'offline';
    lastBackup: Date;
    storageUsed: number;
}

interface Activity {
    type: 'user' | 'internship' | 'application';
    action: string;
    timestamp: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<PlatformStats>({
        totalUsers: 0,
        students: 0,
        mentors: 0,
        admins: 0,
        activeInternships: 0,
        totalApplications: 0,
        newUsersThisMonth: 0,
        activeStudents: 0,
        verifiedMentors: 0
    });
    const [systemHealth] = useState<SystemHealth>({
        database: 'online',
        api: 'online',
        lastBackup: new Date(),
        storageUsed: 65
    });
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'ADMIN') {
            router.push('/login');
            return;
        }

        setUser(parsedUser);
        fetchAdminStats(token);
        fetchRecentActivity(token);
    }, [router]);

    const fetchAdminStats = async (token: string) => {
        try {
            const response = await fetch('/api/admin/stats', {
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

    const fetchRecentActivity = async (token: string) => {
        try {
            const response = await fetch('/api/admin/activity', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setRecentActivity(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-lg text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">H</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                HUSTL Admin
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/admin/dashboard" className="text-slate-900 font-medium">Dashboard</Link>
                            <Link href="/admin/users" className="text-slate-600 hover:text-slate-900">Users</Link>
                            <Link href="/admin/internships" className="text-slate-600 hover:text-slate-900">Internships</Link>
                            <Link href="/admin/analytics" className="text-slate-600 hover:text-slate-900">Analytics</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-slate-900 mb-2">
                        Admin Dashboard
                    </h2>
                    <p className="text-slate-600 text-lg">
                        Manage platform, users, and content
                    </p>
                </div>

                {/* Stats Cards - 3x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-purple-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">+{stats.newUsersThisMonth} this month</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers}</h3>
                        <p className="text-sm text-slate-600">Total Users</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-blue-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <span className="text-blue-600 text-sm font-semibold">{stats.activeStudents} active</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.students}</h3>
                        <p className="text-sm text-slate-600">Students</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-indigo-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-indigo-600 text-sm font-semibold">{stats.verifiedMentors} verified</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.mentors}</h3>
                        <p className="text-sm text-slate-600">Mentors</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-pink-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-pink-600 text-sm font-semibold">Platform</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.admins}</h3>
                        <p className="text-sm text-slate-600">Admins</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-green-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-green-600 text-sm font-semibold">Posted</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.activeInternships}</h3>
                        <p className="text-sm text-slate-600">Active Internships</p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg shadow-orange-500/5 border border-slate-200/60 hover:shadow-xl transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="text-orange-600 text-sm font-semibold">All time</span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalApplications}</h3>
                        <p className="text-sm text-slate-600">Total Applications</p>
                    </div>
                </div>

                {/* Platform Health */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60 mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Platform Health</h3>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${systemHealth.database === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Database</p>
                                <p className="text-xs text-slate-600 capitalize">{systemHealth.database}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${systemHealth.api === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">API Status</p>
                                <p className="text-xs text-slate-600 capitalize">{systemHealth.api}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Last Backup</p>
                                <p className="text-xs text-slate-600">{systemHealth.lastBackup.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Storage</p>
                                <p className="text-xs text-slate-600">{systemHealth.storageUsed}% used</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions and Recent Activity */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Link href="/admin/users" className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-purple-300">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-2">Manage Users</h4>
                                    <p className="text-sm text-slate-600">Add, edit, or remove users</p>
                                </Link>

                                <Link href="/admin/internships" className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-green-300">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-2">Manage Internships</h4>
                                    <p className="text-sm text-slate-600">Post and manage listings</p>
                                </Link>

                                <Link href="/admin/analytics" className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-blue-300">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-2">View Analytics</h4>
                                    <p className="text-sm text-slate-600">Platform usage insights</p>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                            <div className="space-y-4">
                                {recentActivity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'user' ? 'bg-purple-500' :
                                                activity.type === 'internship' ? 'bg-green-500' :
                                                    'bg-blue-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                                            <p className="text-xs text-slate-500">{formatTimestamp(activity.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
