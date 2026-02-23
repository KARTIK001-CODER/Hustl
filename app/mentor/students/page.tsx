'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
    id: string;
    user: {
        fullName: string;
        email: string;
    };
    university: string;
    major: string;
    graduationYear: number;
    applicationCount: number;
    appliedCount: number;
    interviewCount: number;
    offerCount: number;
}

export default function MentorStudentsPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'applicants' | 'discover' | 'mentored'>('applicants');

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

        fetchStudents(token);
    }, [router]);

    const fetchStudents = async (token: string) => {
        try {
            const response = await fetch('/api/mentors/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStudents(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-lg text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

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
                            <Link href="/mentor/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
                            <Link href="/mentor/students" className="text-slate-900 font-medium">Students</Link>
                            <Link href="/mentor/feedback" className="text-slate-600 hover:text-slate-900">Feedback</Link>
                            <Link href="/mentor/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Link href="/mentor/dashboard" className="text-indigo-600 mb-6 inline-block hover:text-indigo-700">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Student Library</h1>
                <p className="text-slate-600 mb-8">Discover talent and track your applicants</p>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
                    {[
                        { id: 'applicants', label: 'Direct Applicants', count: students.filter(s => (s as any).isYourApplicant).length },
                        { id: 'discover', label: 'Talent Pool', count: students.length },
                        { id: 'mentored', label: 'Your Mentored', count: students.filter(s => (s as any).hasInteracted).length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`pb-4 px-2 font-bold text-sm transition-all whitespace-nowrap relative ${activeTab === tab.id
                                    ? 'text-indigo-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {students.filter(s => {
                    if (activeTab === 'applicants') return (s as any).isYourApplicant;
                    if (activeTab === 'mentored') return (s as any).hasInteracted;
                    return true;
                }).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-dashed border-slate-200">
                        <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-slate-600 text-lg">No students found in this category</p>
                        <p className="text-slate-500 text-sm mt-2">Try switching to the "Talent Pool" to see all available students</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students
                            .filter(s => {
                                if (activeTab === 'applicants') return (s as any).isYourApplicant;
                                if (activeTab === 'mentored') return (s as any).hasInteracted;
                                return true;
                            })
                            .map(student => (
                                <div key={student.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                                    {(student as any).isYourApplicant && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-bl-lg">
                                            Applicant
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {student.user.fullName.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold text-slate-900 truncate">{student.user.fullName}</h3>
                                            <p className="text-sm text-slate-600 truncate">{student.university}</p>
                                            <p className="text-xs text-slate-500 truncate">{student.major}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                            Class of {student.graduationYear}
                                        </span>
                                    </div>

                                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        {(student as any).isYourApplicant ? (
                                            <>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                                    Target Roles at Your Company:
                                                </p>
                                                <div className="space-y-2">
                                                    {(student as any).companyApplications?.map((app: any) => (
                                                        <div key={app.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-slate-100">
                                                            <span className="font-bold text-slate-600 truncate mr-2">{app.title}</span>
                                                            <span className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${app.status === 'APPLIED' ? 'bg-blue-50 text-blue-600' :
                                                                    app.status === 'INTERVIEW' ? 'bg-yellow-50 text-yellow-600' :
                                                                        'bg-green-50 text-green-600'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="py-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Global Experience</p>
                                                <p className="text-sm text-slate-700 font-bold">
                                                    {(student as any).totalApplicationCount || 0} applications tracked elsewhere
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1 italic">Potential candidate for your open roles</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/mentor/students/${student.id}`}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center rounded-lg font-semibold hover:shadow-lg transition text-sm"
                                        >
                                            View Profile
                                        </Link>
                                        <Link
                                            href={`/mentor/feedback?studentId=${student.id}`}
                                            className="flex-1 px-4 py-2 border-2 border-purple-600 text-purple-600 text-center rounded-lg font-semibold hover:bg-purple-50 transition text-sm"
                                        >
                                            Feedback
                                        </Link>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
