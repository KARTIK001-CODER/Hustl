'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ApplicationFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const internshipId = searchParams.get('internshipId');

    const [internship, setInternship] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        resumeUrl: '',
        coverLetter: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!internshipId) {
            router.push('/student/internships');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch internship details directly
        const fetchInternshipDetails = async () => {
            try {
                const response = await fetch(`/api/internships/${internshipId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    setInternship(data.data);
                } else {
                    console.error('Internship not found');
                    router.push('/student/internships');
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInternshipDetails();
    }, [internshipId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    internshipId,
                    ...formData
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Redirect to applications page to see the new application
                router.push('/student/applications');
            } else {
                alert(data.message || 'Application failed.');
            }
        } catch (error) {
            alert('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
            </div>
        );
    }

    if (!internship) return null;

    return (
        <div className="min-h-screen bg-hustl-sandstone py-16 px-6 selection:bg-hustl-terracotta/20">
            <div className="max-w-3xl mx-auto">
                <Link href="/student/internships" className="text-hustl-teal hover:text-hustl-teal/80 font-bold mb-10 inline-flex items-center gap-3 uppercase tracking-widest text-xs transition-all group">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </div>
                    Back to Terminal
                </Link>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-12 border-b border-slate-50">
                        <span className="px-4 py-1 bg-hustl-terracotta/10 text-hustl-terracotta text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                            New Deployment
                        </span>
                        <h1 className="text-4xl font-black text-hustl-charcoal tracking-tighter mb-2">Apply for {internship.title}</h1>
                        <p className="text-hustl-teal font-bold text-xl">{internship.company}</p>
                    </div>

                    <div className="p-12 bg-slate-50/20">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div>
                                <label htmlFor="resumeUrl" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                    Strategic Portfolio <span className="text-hustl-terracotta">*</span>
                                </label>
                                <input
                                    id="resumeUrl"
                                    type="url"
                                    required
                                    value={formData.resumeUrl}
                                    onChange={e => setFormData({ ...formData, resumeUrl: e.target.value })}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal outline-none transition-all font-bold text-lg text-hustl-charcoal placeholder:text-slate-200"
                                />
                                <p className="text-xs text-slate-400 mt-4 font-medium italic">
                                    Anchor your professional footprint (LinkedIn, Portfolio, or Cloud Resume link).
                                </p>
                            </div>

                            <div>
                                <label htmlFor="coverLetter" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                    The Value Proposition <span className="text-hustl-terracotta">*</span>
                                </label>
                                <textarea
                                    id="coverLetter"
                                    required
                                    rows={8}
                                    value={formData.coverLetter}
                                    onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                    placeholder="Synthesize why your expertise is critical for this mission..."
                                    className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal outline-none transition-all resize-none font-medium text-lg text-hustl-charcoal placeholder:text-slate-200 leading-relaxed"
                                />
                            </div>

                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-hustl-teal text-white font-black py-6 rounded-2xl hover:shadow-2xl hover:shadow-hustl-teal/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 uppercase tracking-[0.2em] text-sm"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Encrypting & Sending...
                                        </>
                                    ) : (
                                        'Launch Application 🚀'
                                    )}
                                </button>
                                <p className="text-center text-[10px] text-slate-300 mt-6 font-black uppercase tracking-widest">
                                    Secure Transmission protocol enabled
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ApplicationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
            </div>
        }>
            <ApplicationFormContent />
        </Suspense>
    );
}
