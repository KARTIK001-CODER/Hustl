'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EligibilityData {
    isEligible: boolean;
    eligibilityScore: number;
    testAttempts: number;
    maxAttempts: number;
    canRetake: boolean;
    canTakeTest: boolean;
    nextTestAvailable: string;
    bestScore: number;
    recentAttempts: Array<{
        date: string;
        score: number;
        passed: boolean;
        testTitle: string;
    }>;
}

export default function EligibilityStatus() {
    const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEligibilityStatus();
    }, []);

    const fetchEligibilityStatus = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/students/eligibility', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setEligibility(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch eligibility:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-20 bg-slate-100 rounded"></div>
            </div>
        );
    }

    if (!eligibility) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
                Application Eligibility Status
            </h3>

            {eligibility.isEligible ? (
                // ELIGIBLE STATE
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <svg className="w-8 h-8 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-green-900">You're Eligible! 🎉</p>
                            <p className="text-sm text-green-700">
                                You can now apply to any internship on the platform
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Your Score</p>
                            <p className="text-2xl font-bold text-slate-900">{eligibility.eligibilityScore}%</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Test Attempts</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {eligibility.testAttempts}/{eligibility.maxAttempts}
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // NOT ELIGIBLE STATE
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <svg className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="font-semibold text-yellow-900">Eligibility Test Required</p>
                            <p className="text-sm text-yellow-700">
                                Pass the test with 70% or higher to apply for internships
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Best Score</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {eligibility.bestScore}%
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">Attempts Used</p>
                            <p className="text-2xl font-bold text-slate-900">
                                {eligibility.testAttempts}/{eligibility.maxAttempts}
                            </p>
                        </div>
                    </div>

                    {eligibility.canTakeTest ? (
                        <Link
                            href="/student/internships"
                            className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold rounded-xl hover:shadow-lg transition"
                        >
                            {eligibility.testAttempts === 0 ? 'Take Eligibility Test' : 'Retake Test'}
                        </Link>
                    ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                                Next test available: {eligibility.nextTestAvailable}
                            </p>
                        </div>
                    )}

                    {!eligibility.canRetake && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700 font-semibold">
                                ⚠️ Maximum attempts reached. Please contact support for assistance.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Attempts */}
            {eligibility.recentAttempts.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-slate-900 mb-3">Recent Attempts</h4>
                    <div className="space-y-2">
                        {eligibility.recentAttempts.map((attempt, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{attempt.testTitle}</p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(attempt.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                                        {attempt.score.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {attempt.passed ? '✓ Passed' : '✗ Failed'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
