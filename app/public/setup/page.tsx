'use client';

import Link from 'next/link';

export default function DatabaseSetupPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Setup Required</h1>
                    <p className="text-slate-600">The HUSTL platform needs a database connection to function properly.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-blue-900 mb-3">📋 Quick Setup Guide</h2>
                    <ol className="space-y-3 text-sm text-blue-900">
                        <li className="flex gap-3">
                            <span className="font-bold">1.</span>
                            <div>
                                <strong>Install PostgreSQL</strong>
                                <p className="text-blue-700 mt-1">Download from <a href="https://www.postgresql.org/download/" target="_blank" className="underline">postgresql.org</a> or use a cloud service like Supabase, Railway, or Neon.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">2.</span>
                            <div>
                                <strong>Update .env file</strong>
                                <pre className="bg-blue-900 text-blue-100 p-2 rounded mt-1 text-xs overflow-x-auto">
                                    DATABASE_URL="postgresql://username:password@localhost:5432/hustl_db"
                                </pre>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">3.</span>
                            <div>
                                <strong>Generate Prisma Client</strong>
                                <pre className="bg-blue-900 text-blue-100 p-2 rounded mt-1 text-xs">
                                    npm run prisma:generate
                                </pre>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">4.</span>
                            <div>
                                <strong>Run Database Migrations</strong>
                                <pre className="bg-blue-900 text-blue-100 p-2 rounded mt-1 text-xs">
                                    npm run prisma:migrate
                                </pre>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold">5.</span>
                            <div>
                                <strong>Seed Test Data (Optional)</strong>
                                <pre className="bg-blue-900 text-blue-100 p-2 rounded mt-1 text-xs">
                                    npm run prisma:seed
                                </pre>
                            </div>
                        </li>
                    </ol>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-slate-900 mb-3">🎯 What's Working Now:</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Frontend UI (Landing, Login, Signup pages)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Student Dashboard UI
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Internships Listing UI
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            Applications Tracking UI
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-slate-900 mb-3">⏳ What Needs Database:</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        <li className="flex items-center gap-2">
                            <span className="text-yellow-600">○</span>
                            User Authentication (Signup/Login)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-yellow-600">○</span>
                            Internship Applications
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-yellow-600">○</span>
                            Mentor Feedback System
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-yellow-600">○</span>
                            Data Persistence
                        </li>
                    </ul>
                </div>

                <div className="flex gap-4">
                    <Link
                        href="/"
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                    <a
                        href="https://github.com/yourusername/hustl#database-setup"
                        target="_blank"
                        className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold text-center hover:bg-slate-300 transition-all duration-300"
                    >
                        View Full Docs
                    </a>
                </div>

                <div className="mt-6 text-center text-sm text-slate-500">
                    <p>Need help? Check the README.md file in the project root.</p>
                </div>
            </div>
        </div>
    );
}
