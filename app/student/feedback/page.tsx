'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';

interface Feedback {
    id: string;
    rating: number;
    comment: string;
    actionItems?: string[];
    createdAt: string;
    mentor?: {
        user?: {
            fullName: string;
        };
    };
    application?: {
        internship?: {
            title: string;
            company: string;
        };
    };
}

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

export default function FeedbackPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        setUser(JSON.parse(userData));
        fetchFeedback(token);
    }, [router]);

    const fetchFeedback = async (token: string) => {
        try {
            const response = await fetch('/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.success) {
                // Sort by date (newest first)
                const sorted = (data.data || []).sort((a: Feedback, b: Feedback) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setFeedbackList(sorted);
            }
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return [...Array(5)].map((_, i) => (
            <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-bold text-hustl-charcoal tracking-tight">Loading insights...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            {/* Navigation */}
            <StudentNavbar user={user} />

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <Link href="/student/dashboard" className="text-hustl-teal hover:text-hustl-teal/80 font-bold mb-6 inline-flex items-center gap-2 uppercase tracking-widest text-xs transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Control Center
                    </Link>
                    <h1 className="text-4xl font-black text-hustl-charcoal mt-4 mb-3 tracking-tight">Growth & Feedback 💎</h1>
                    <p className="text-slate-500 text-xl font-medium">Expert insights to sharpen your professional edge</p>
                </div>

                {/* Empty State */}
                {!loading && feedbackList.length === 0 && (
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
                                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                />
                            </svg>
                        </div>
                        <p className="text-2xl font-black text-hustl-charcoal mb-4">No reviews yet</p>
                        <p className="text-slate-400 font-medium">Mentors will leave feedback on your active applications</p>
                    </div>
                )}

                {/* Feedback Cards */}
                <div className="space-y-8">
                    {feedbackList.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex flex-col md:flex-row gap-10">
                                {/* Mentor & Rating Info */}
                                <div className="md:w-64 flex-shrink-0">
                                    <div className="mb-6">
                                        <div className="w-20 h-20 bg-hustl-sandstone rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <span className="text-hustl-teal font-black text-2xl">
                                                {feedback.mentor?.user?.fullName?.charAt(0) || 'M'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-hustl-charcoal mb-1 tracking-tight">
                                            {feedback.mentor?.user?.fullName || 'Mentor'}
                                        </h3>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {formatDate(feedback.createdAt)}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl">
                                        <div className="flex items-center gap-1 mb-2">
                                            {renderStars(feedback.rating)}
                                        </div>
                                        <p className="text-hustl-charcoal font-black text-2xl tracking-tighter">
                                            {feedback.rating.toFixed(1)}<span className="text-slate-300 text-lg">/5</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1">
                                    {feedback.application?.internship && (
                                        <div className="mb-8">
                                            <span className="px-4 py-1 bg-hustl-terracotta/10 text-hustl-terracotta text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
                                                Role Context
                                            </span>
                                            <h4 className="text-2xl font-black text-hustl-charcoal tracking-tight">
                                                {feedback.application.internship.title}
                                            </h4>
                                            <p className="text-hustl-teal font-bold text-lg">
                                                {feedback.application.internship.company}
                                            </p>
                                        </div>
                                    )}

                                    {/* Comment */}
                                    <div className="relative">
                                        <svg className="absolute -left-6 top-0 w-12 h-12 text-hustl-sandstone -z-10" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.851h4.005v10h-10zm-14 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.154c-2.433.917-3.996 3.638-3.996 5.852h4v10h-10z" />
                                        </svg>
                                        <p className="text-slate-600 text-lg font-medium leading-relaxed italic mb-8">
                                            {feedback.comment}
                                        </p>
                                    </div>

                                    {/* Action Items */}
                                    {feedback.actionItems && feedback.actionItems.length > 0 && (
                                        <div className="pt-8 border-t border-slate-50">
                                            <h5 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                                Strategic Adjustments
                                                <div className="h-[2px] flex-1 bg-slate-50" />
                                            </h5>
                                            <div className="grid gap-4">
                                                {feedback.actionItems.map((item, index) => (
                                                    <div key={index} className="flex items-start gap-4 p-5 bg-hustl-sandstone/30 rounded-2xl group/item hover:bg-hustl-teal/5 transition-colors">
                                                        <div className="w-6 h-6 bg-hustl-teal text-white rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-slate-700 font-bold text-sm tracking-tight">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
