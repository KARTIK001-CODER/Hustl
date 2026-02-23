'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface StudentDetail {
    id: string;
    university: string;
    major: string;
    graduationYear: number;
    skills: string[];
    bio: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    applications: Array<{
        id: string;
        status: string;
        appliedAt: string;
        coverLetter: string;
        resumeUrl: string;
        internship: {
            title: string;
            company: string;
        }
    }>;
    testAttemptRecords: Array<{
        id: string;
        test: { title: string };
        percentage: number;
        passed: boolean;
        completedAt: string;
    }>;
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const router = useRouter();
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [mentorCompany, setMentorCompany] = useState<string>('');

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setMentorCompany(parsedUser.roleData?.company || '');
        fetchStudentDetails(studentId, token);
    }, [studentId, router]);

    const fetchStudentDetails = async (id: string, token: string) => {
        try {
            // We need a specific endpoint for student details for mentors
            const response = await fetch(`/api/students/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setStudent(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch student details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!student) return <div>Student not found</div>;

    const companyApps = student.applications.filter(
        app => app.internship.company.toLowerCase() === mentorCompany.toLowerCase()
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/mentor/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                            <h1 className="text-xl font-bold text-slate-900">HUSTL Mentor</h1>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-12">
                <Link href="/mentor/students" className="text-indigo-600 mb-8 inline-block font-medium hover:underline">
                    ← Back to All Students
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                                {student.user.firstName.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{student.user.firstName} {student.user.lastName}</h1>
                                <p className="opacity-90 font-medium">{student.university} • {student.major}</p>
                                <div className="mt-4 flex gap-4">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Class of {student.graduationYear}
                                    </span>
                                    <span className="px-3 py-1 bg-emerald-400/20 text-emerald-100 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Verified Talent
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3">
                        {/* Left Sidebar */}
                        <div className="p-8 border-r border-slate-100 bg-slate-50/50">
                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Info</h3>
                                <p className="text-slate-900 font-medium break-all">{student.user.email}</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {student.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
                                <Link
                                    href={`/mentor/feedback?studentId=${student.id}`}
                                    className="w-full block px-6 py-3 bg-indigo-600 text-white text-center rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Write Review
                                </Link>
                                <button className="w-full mt-3 px-6 py-3 border-2 border-slate-200 text-slate-600 text-center rounded-xl font-bold hover:bg-slate-50 transition">
                                    Schedule Interview
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-2 p-8 space-y-12">
                            {/* Bio */}
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Professional Synopsis</h2>
                                <p className="text-slate-600 leading-relaxed italic">
                                    "{student.bio || 'No bio provided.'}"
                                </p>
                            </section>

                            {/* Applications to Mentor's Company */}
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    Applications at {mentorCompany}
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-xs">{companyApps.length}</span>
                                </h2>

                                <div className="space-y-6">
                                    {companyApps.map(app => (
                                        <div key={app.id} className="border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-slate-900">{app.internship.title}</h4>
                                                    <p className="text-sm text-slate-500">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${app.status === 'APPLIED' ? 'bg-blue-100 text-blue-700' :
                                                    app.status === 'INTERVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>

                                            <div className="mb-4">
                                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Value Proposition</h5>
                                                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 line-clamp-3">
                                                    {app.coverLetter}
                                                </div>
                                            </div>

                                            {app.resumeUrl && (
                                                <a
                                                    href={app.resumeUrl}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    View Strategic Portfolio
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                    {companyApps.length === 0 && (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                                            <p className="text-slate-500">No direct applications to your current organization.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Academic Performance / Tests */}
                            <section>
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Milestone Performance</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {student.testAttemptRecords.map(record => (
                                        <div key={record.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{record.test.title}</p>
                                            <div className="flex items-end justify-between">
                                                <span className={`text-2xl font-black ${record.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {Math.round(record.percentage)}%
                                                </span>
                                                <span className={`text-[10px] font-bold uppercase ${record.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {record.passed ? 'Benchmark Passed' : 'Benchmark Failed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
