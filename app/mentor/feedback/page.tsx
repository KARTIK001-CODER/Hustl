'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
    id: string;
    user: {
        fullName: string;
    };
    university: string;
}

interface Application {
    id: string;
    company: string;
    position: string;
}

interface RecentFeedback {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    student?: {
        user?: {
            firstName: string;
            lastName: string;
        };
    };
}

export default function MentorFeedbackPage() {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [recentFeedback, setRecentFeedback] = useState<RecentFeedback[]>([]);

    const [formData, setFormData] = useState({
        studentId: '',
        applicationId: '',
        rating: 5,
        comment: '',
        strengths: '',
        improvements: '',
        actionItems: '',
        sentiment: 'CONSTRUCTIVE'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

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
        fetchRecentFeedback(token);
    }, [router]);

    useEffect(() => {
        if (formData.studentId) {
            const token = localStorage.getItem('auth_token');
            if (token) {
                fetchStudentApplications(formData.studentId, token);
            }
        }
    }, [formData.studentId]);

    const fetchStudents = async (token: string) => {
        try {
            const response = await fetch('/api/mentors/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setStudents(data.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const fetchStudentApplications = async (studentId: string, token: string) => {
        try {
            const response = await fetch(`/api/students/${studentId}/applications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setApplications(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            setApplications([]);
        }
    };

    const fetchRecentFeedback = async (token: string) => {
        try {
            const response = await fetch('/api/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) setRecentFeedback(data.data.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch feedback:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');

        try {
            const payload = {
                studentId: formData.studentId,
                applicationId: formData.applicationId || undefined,
                rating: formData.rating,
                comment: formData.comment,
                sentiment: formData.sentiment,
                strengths: formData.strengths.split('\n').filter(s => s.trim()),
                improvements: formData.improvements.split('\n').filter(s => s.trim()),
                actionItems: formData.actionItems.split('\n').filter(s => s.trim()),
            };

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Feedback submitted successfully! 🎉');
                setFormData({
                    studentId: '',
                    applicationId: '',
                    rating: 5,
                    comment: '',
                    strengths: '',
                    improvements: '',
                    actionItems: '',
                    sentiment: 'CONSTRUCTIVE'
                });
                fetchRecentFeedback(token!);
            } else {
                setError(data.error || 'Failed to submit feedback');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

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
                            <Link href="/mentor/students" className="text-slate-600 hover:text-slate-900">Students</Link>
                            <Link href="/mentor/feedback" className="text-slate-900 font-medium">Feedback</Link>
                            <Link href="/mentor/profile" className="text-slate-600 hover:text-slate-900">Profile</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <Link href="/mentor/dashboard" className="text-indigo-600 mb-6 inline-block hover:text-indigo-700">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-2">Provide Feedback</h1>
                <p className="text-slate-600 mb-8">Help students improve their applications</p>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Feedback Form - 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/60">
                            {successMessage && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <p className="text-sm text-green-700">{successMessage}</p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Select Student *
                                    </label>
                                    <select
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value, applicationId: '' })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    >
                                        <option value="">Choose a student</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.user.fullName} - {student.university}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {formData.studentId && applications.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Related Application (Optional)
                                        </label>
                                        <select
                                            value={formData.applicationId}
                                            onChange={(e) => setFormData({ ...formData, applicationId: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">General feedback (not application-specific)</option>
                                            {applications.map(app => (
                                                <option key={app.id} value={app.id}>
                                                    {app.company} - {app.position}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Rating (1-5) *
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, rating: star })}
                                                className="focus:outline-none"
                                            >
                                                <svg className={`w-10 h-10 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-300 transition`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                        <span className="ml-3 text-lg font-semibold text-slate-700">{formData.rating}/5</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Feedback Comment *
                                    </label>
                                    <textarea
                                        value={formData.comment}
                                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                                        placeholder="Provide constructive feedback to help the student improve..."
                                        required
                                        minLength={50}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">{formData.comment.length} characters (min 50)</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Strengths
                                    </label>
                                    <textarea
                                        value={formData.strengths}
                                        onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                        placeholder="What is the student doing well? (one per line)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Areas for Improvement
                                    </label>
                                    <textarea
                                        value={formData.improvements}
                                        onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                                        placeholder="What can the student improve? (one per line)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Action Items *
                                    </label>
                                    <textarea
                                        value={formData.actionItems}
                                        onChange={(e) => setFormData({ ...formData, actionItems: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                                        placeholder="Specific action items (one per line):
• Update resume with quantified achievements
• Practice STAR method for interviews
• Research the company culture"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Sentiment
                                    </label>
                                    <div className="flex gap-3">
                                        {[
                                            { value: 'POSITIVE', label: 'Positive', color: 'green' },
                                            { value: 'NEUTRAL', label: 'Neutral', color: 'blue' },
                                            { value: 'CONSTRUCTIVE', label: 'Constructive', color: 'orange' }
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, sentiment: option.value })}
                                                className={`px-4 py-2 rounded-lg font-semibold transition ${formData.sentiment === option.value
                                                        ? `bg-${option.color}-100 text-${option.color}-700 border-2 border-${option.color}-300`
                                                        : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-300'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.studentId}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Recent Feedback - 1/3 width */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Feedback</h3>
                            <div className="space-y-3">
                                {recentFeedback.length === 0 ? (
                                    <p className="text-sm text-slate-500">No feedback yet</p>
                                ) : (
                                    recentFeedback.map(feedback => (
                                        <div key={feedback.id} className="p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {feedback.student?.user ?
                                                        `${feedback.student.user.firstName} ${feedback.student.user.lastName}` :
                                                        'Student'}
                                                </p>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 line-clamp-2">{feedback.comment}</p>
                                            <p className="text-xs text-slate-500 mt-1">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
