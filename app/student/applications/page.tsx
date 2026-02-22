'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';

interface Application {
    id: string;
    position: string;
    company: string;
    status: string;
    appliedDate: string;
    notes?: string;
    internship?: {
        title: string;
        company: string;
        location: string;
        type: string;
    };
    appliedAt?: string;
}

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

export default function ApplicationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchApplications(token);
    }, [router]);

    const fetchApplications = async (token: string) => {
        try {
            const response = await fetch('/api/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                // Transform API data to match our interface
                const transformedApps = (data.data || []).map((app: any) => ({
                    id: app.id,
                    position: app.internship?.title || 'N/A',
                    company: app.internship?.company || 'N/A',
                    status: app.status,
                    appliedDate: app.appliedAt,
                    notes: app.notes,
                    internship: app.internship
                }));

                // Sort by date (newest first)
                transformedApps.sort((a: Application, b: Application) =>
                    new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
                );

                setApplications(transformedApps);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };


    const statusColors: Record<string, string> = {
        APPLIED: 'bg-blue-100 text-blue-700',
        SCREENING: 'bg-purple-100 text-purple-700',
        INTERVIEW: 'bg-yellow-100 text-yellow-700',
        TECHNICAL: 'bg-orange-100 text-orange-700',
        OFFER: 'bg-green-100 text-green-700',
        ACCEPTED: 'bg-emerald-100 text-emerald-700',
        REJECTED: 'bg-red-100 text-red-700',
        WITHDRAWN: 'bg-gray-100 text-gray-700'
    };

    const formatStatus = (status: string) => {
        return status.charAt(0) + status.slice(1).toLowerCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-bold text-hustl-charcoal tracking-tight">Loading pipeline...</p>
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
                    <Link href="/student/dashboard" className="text-hustl-teal hover:text-hustl-teal/80 font-bold mb-6 inline-flex items-center gap-2 uppercase tracking-widest text-xs transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Control Center
                    </Link>
                    <h1 className="text-4xl font-black text-hustl-charcoal mt-4 mb-3 tracking-tight">Active Pipeline 🚀</h1>
                    <p className="text-slate-500 text-xl font-medium">Track and manage your professional trajectory</p>
                </div>

                {/* Empty State */}
                {!loading && applications.length === 0 && (
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <p className="text-2xl font-black text-hustl-charcoal mb-4">Pipeline is empty</p>
                        <p className="text-slate-400 font-medium mb-8">You haven't applied to any roles yet</p>
                        <Link
                            href="/student/internships"
                            className="px-8 py-4 bg-hustl-teal text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                        >
                            Find Your First Role
                        </Link>
                    </div>
                )}

                {/* Application Cards */}
                <div className="space-y-6">
                    {applications.map((application) => (
                        <div
                            key={application.id}
                            className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                                {/* Left Side - Application Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-6">
                                        {/* Company Logo */}
                                        <div className="w-16 h-16 bg-hustl-sandstone rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-hustl-teal font-black text-2xl">
                                                {application.company.charAt(0)}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-black text-hustl-charcoal tracking-tight">
                                                    {application.position}
                                                </h3>
                                                <span
                                                    className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[application.status] || 'bg-slate-100 text-slate-700'
                                                        }`}
                                                >
                                                    {formatStatus(application.status)}
                                                </span>
                                            </div>
                                            <p className="text-hustl-terracotta font-bold text-lg mb-4">
                                                {application.company}
                                            </p>

                                            {/* Meta Information */}
                                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="uppercase tracking-widest">{formatDate(application.appliedDate)}</span>
                                                </div>

                                                {application.internship?.location && (
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="uppercase tracking-widest">{application.internship.location}</span>
                                                    </div>
                                                )}

                                                {application.internship?.type && (
                                                    <span className="uppercase tracking-widest">{application.internship.type}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side - Actions */}
                                <div className="flex items-center gap-4">
                                    <Link
                                        href={`/student/applications/${application.id}`}
                                        className="px-8 py-4 bg-white border-2 border-gray-100 text-hustl-charcoal rounded-2xl font-bold hover:border-hustl-teal hover:text-hustl-teal hover:shadow-xl transition-all uppercase tracking-widest text-xs"
                                    >
                                        Full Details
                                    </Link>
                                    <button className="p-4 bg-slate-50 text-slate-300 rounded-2xl hover:text-hustl-terracotta hover:bg-hustl-terracotta/5 transition-all">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Notes Snippet */}
                            {application.notes && (
                                <div className="mt-8 pt-8 border-t border-slate-50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 flex-shrink-0">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 font-medium italic leading-relaxed">
                                            {application.notes}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
