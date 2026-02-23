'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TakeTestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const testId = searchParams.get('testId');
    const [test, setTest] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (testId) {
            fetchTest(testId);
        } else {
            setError("No test specified. Please select a test from the internships page.");
            setLoading(false);
        }
    }, [testId]);

    useEffect(() => {
        if (timeRemaining > 0 && !isSubmitting) {
            const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeRemaining === 0 && test && !isSubmitting && !loading) {
            handleSubmit();
        }
    }, [timeRemaining, test, isSubmitting, loading]);

    const fetchTest = async (id: string) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch(`/api/tests/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (data.success) {
                setTest(data.data);
                setTimeRemaining(data.data.duration * 60);
            } else {
                setError(data.message || "Failed to load test.");
            }
        } catch (err) {
            setError("Network error loading test.");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch('/api/test-attempts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    testId: test.id,
                    answers,
                    timeSpent: test.duration * 60 - timeRemaining,
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(data.data.message);
                router.push('/student/dashboard');
            } else {
                alert('Failed to submit test: ' + (data.error || "Unknown error"));
                setIsSubmitting(false);
            }
        } catch (error) {
            alert('Network error. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-black text-hustl-charcoal tracking-tight">Initializing environment...</p>
                </div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone p-6">
                <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-hustl-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-6 text-hustl-terracotta">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-hustl-charcoal mb-3 tracking-tight">System Notice</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error || "Test not found"}</p>
                    <Link href="/student/internships" className="inline-block px-8 py-4 bg-hustl-charcoal text-white rounded-2xl font-bold hover:shadow-xl transition-all uppercase tracking-widest text-xs">
                        Back to Terminal
                    </Link>
                </div>
            </div>
        );
    }

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Header */}
                <header className="bg-white rounded-[2rem] p-8 shadow-sm mb-12 sticky top-6 z-20 border border-gray-100/50 backdrop-blur-xl bg-white/90">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <span className="px-4 py-1 bg-hustl-teal/10 text-hustl-teal text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
                                Active Assessment
                            </span>
                            <h1 className="text-3xl font-black text-hustl-charcoal tracking-tight">{test.title}</h1>
                            <p className="text-slate-400 font-medium text-sm mt-1">{test.description}</p>
                        </div>
                        <div className="bg-hustl-charcoal text-white rounded-[1.5rem] px-8 py-4 flex flex-col items-center min-w-[160px] shadow-2xl">
                            <div className={`text-4xl font-black font-mono tracking-tighter ${timeRemaining < 60 ? 'text-hustl-terracotta animate-pulse' : 'text-hustl-teal'}`}>
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-50">Pulse Clock</p>
                        </div>
                    </div>
                </header>

                {/* Questions */}
                <div className="space-y-8 pb-32">
                    {test.questions && test.questions.map((question: any, index: number) => (
                        <div key={question.id || index} className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 group hover:shadow-xl transition-all duration-500">
                            <div className="flex gap-6 mb-10">
                                <span className="flex-shrink-0 w-12 h-12 bg-hustl-sandstone text-hustl-teal rounded-2xl flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </span>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-hustl-charcoal leading-tight tracking-tight">{question.text || question.question}</h3>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {question.options && question.options.map((option: string, optIndex: number) => (
                                    <label
                                        key={optIndex}
                                        className={`flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${answers[question.id || index] === option
                                            ? 'border-hustl-teal bg-hustl-teal/5 shadow-inner'
                                            : 'border-slate-50 hover:border-hustl-teal/20 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div className="relative flex items-center justify-center w-6 h-6 mr-4">
                                            <input
                                                type="radio"
                                                name={`question-${question.id || index}`}
                                                value={option}
                                                checked={answers[question.id || index] === option}
                                                onChange={() => handleAnswerChange(question.id || index.toString(), option)}
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                            />
                                            <div className={`w-6 h-6 rounded-full border-2 transition-all ${answers[question.id || index] === option ? 'border-hustl-teal bg-hustl-teal' : 'border-slate-200 bg-white'}`}>
                                                {answers[question.id || index] === option && (
                                                    <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-lg font-bold tracking-tight transition-colors ${answers[question.id || index] === option ? 'text-hustl-teal' : 'text-slate-600'}`}>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[...Array(Math.min(5, Object.keys(answers).length))].map((_, i) => (
                                    <div key={i} className="w-3 h-3 bg-hustl-teal rounded-full ring-2 ring-white" />
                                ))}
                            </div>
                            <div className="text-sm font-black text-hustl-charcoal uppercase tracking-widest">
                                {Object.keys(answers).length} <span className="text-slate-300">/</span> {test.questions?.length || 0} Resolved
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Link
                                href="/student/internships"
                                className="flex-1 md:flex-none px-10 py-4 bg-hustl-sandstone text-hustl-charcoal rounded-2xl font-bold hover:bg-hustl-terracotta hover:text-white transition-all text-center uppercase tracking-widest text-xs"
                            >
                                Abandon
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-[2] md:flex-none px-12 py-4 bg-hustl-teal text-white rounded-2xl font-black hover:shadow-2xl hover:shadow-hustl-teal/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Transmitting...
                                    </>
                                ) : (
                                    'Finalize Submission'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TakeTestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
            </div>
        }>
            <TakeTestContent />
        </Suspense>
    );
}
