'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';

interface Application {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter: string;
    resumeUrl: string;
    notes?: string;
    internship: {
        title: string;
        company: string;
        location: string;
        type: string;
        description: string;
    };
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchApplicationDetails(id, token);
    }, [id, router]);

    const fetchApplicationDetails = async (appId: string, token: string) => {
        try {
            // Reusing the general applications endpoint and filtering for now 
            // Better to have a dedicated /api/applications/[id]
            const response = await fetch('/api/applications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const found = data.data.find((app: any) => app.id === appId);
                if (found) {
                    setApplication(found);
                } else {
                    router.push('/student/applications');
                }
            }
        } catch (error) {
            console.error('Failed to fetch application:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            <StudentNavbar user={user} />

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="mb-12">
                    <Link href="/student/applications" className="text-hustl-teal hover:text-hustl-teal/80 font-bold mb-6 inline-flex items-center gap-2 uppercase tracking-widest text-xs transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Pipeline
                    </Link>

                    <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="px-4 py-1.5 bg-hustl-teal/10 text-hustl-teal text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                                Application ID: {application.id.slice(-8).toUpperCase()}
                            </span>
                            <h1 className="text-4xl font-black text-hustl-charcoal tracking-tight mb-2">
                                {application.internship.title}
                            </h1>
                            <p className="text-hustl-terracotta font-bold text-2xl">{application.internship.company}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${application.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' :
                                    application.status === 'OFFER' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {application.status}
                            </span>
                            <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">
                                Applied on {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail Cards */}
                <div className="grid gap-8">
                    {/* Role Context */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-hustl-charcoal mb-6 uppercase tracking-widest border-b border-slate-50 pb-4">
                            Role Context
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Location</p>
                                <p className="font-bold text-hustl-charcoal">{application.internship.location}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engagement</p>
                                <p className="font-bold text-hustl-charcoal">{application.internship.type}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            {application.internship.description}
                        </p>
                    </div>

                    {/* Submission Data */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-hustl-charcoal mb-6 uppercase tracking-widest border-b border-slate-50 pb-4">
                            Submission Data
                        </h2>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Value Proposition (Cover Letter)</p>
                                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                    <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                                        {application.coverLetter || "No cover letter provided."}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Strategic Portfolio (Resume)</p>
                                {application.resumeUrl ? (
                                    <a
                                        href={application.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-3 px-6 py-4 bg-hustl-charcoal text-white rounded-2xl font-bold hover:shadow-xl transition-all group"
                                    >
                                        <svg className="w-5 h-5 text-hustl-teal group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        Access Remote Asset
                                    </a>
                                ) : (
                                    <p className="text-slate-400 italic">No portfolio link provided.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Feedback if available */}
                    {application.notes && (
                        <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100">
                            <h2 className="text-xl font-black text-amber-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Insider Notes
                            </h2>
                            <p className="text-amber-800 font-medium leading-relaxed italic">
                                "{application.notes}"
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
