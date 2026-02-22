'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MentorUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'MENTOR';
    createdAt: string;
}

interface MentorData {
    company: string;
    expertise: string[];
    yearsExperience: number;
    bio: string;
    linkedinUrl: string;
}

export default function MentorProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<MentorUser | null>(null);
    const [mentorData, setMentorData] = useState<MentorData>({
        company: '',
        expertise: [],
        yearsExperience: 0,
        bio: '',
        linkedinUrl: ''
    });
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        company: '',
        expertise: '',
        yearsExperience: '1-3',
        bio: '',
        linkedinUrl: ''
    });
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFeedback: 0,
        rating: 0
    });

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

        setUser(parsedUser);
        fetchMentorProfile(token);
        fetchMentorStats(token);
    }, [router]);

    const fetchMentorProfile = async (token: string) => {
        try {
            const response = await fetch('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data.mentor) {
                const mentor = data.data.mentor;
                setMentorData(mentor);
                setFormData({
                    company: mentor.company || '',
                    expertise: mentor.expertise?.join(', ') || '',
                    yearsExperience: mentor.yearsExperience?.toString() || '1-3',
                    bio: mentor.bio || '',
                    linkedinUrl: mentor.linkedinUrl || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const fetchMentorStats = async (token: string) => {
        try {
            const response = await fetch('/api/mentors/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStats({
                    totalStudents: data.data.activeStudents,
                    totalFeedback: data.data.feedbackGiven,
                    rating: data.data.averageRating
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    mentor: {
                        company: formData.company,
                        expertise: formData.expertise.split(',').map(s => s.trim()).filter(s => s),
                        yearsExperience: parseInt(formData.yearsExperience) || 0,
                        bio: formData.bio,
                        linkedinUrl: formData.linkedinUrl
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setEditing(false);
                fetchMentorProfile(token!);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-lg text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    const fullName = `${user.firstName} ${user.lastName}`;

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
                            <Link href="/mentor/feedback" className="text-slate-600 hover:text-slate-900">Feedback</Link>
                            <Link href="/mentor/profile" className="text-slate-900 font-medium">Profile</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <Link href="/mentor/dashboard" className="text-indigo-600 mb-6 inline-block hover:text-indigo-700">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-slate-900 mb-8">Mentor Profile</h1>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200/60">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-start gap-6 mb-8 pb-8 border-b">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                            {user.firstName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-slate-900 mb-1">{fullName}</h2>
                            <p className="text-slate-600 mb-2">{user.email}</p>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                    MENTOR
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Company</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className={`w-full p-3 border border-slate-200 rounded-xl ${editing ? 'bg-white' : 'bg-slate-50'}`}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-900 mb-2">Years of Experience</label>
                                <select
                                    value={formData.yearsExperience}
                                    onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                                    className={`w-full p-3 border border-slate-200 rounded-xl ${editing ? 'bg-white' : 'bg-slate-50'}`}
                                    disabled={!editing}
                                >
                                    <option value="1">1-3 years</option>
                                    <option value="3">3-5 years</option>
                                    <option value="5">5-10 years</option>
                                    <option value="10">10+ years</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">Expertise Areas</label>
                            <input
                                type="text"
                                value={formData.expertise}
                                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                                className={`w-full p-3 border border-slate-200 rounded-xl ${editing ? 'bg-white' : 'bg-slate-50'}`}
                                placeholder="Software Engineering, Machine Learning, Product Management"
                                disabled={!editing}
                            />
                            <p className="text-xs text-slate-500 mt-1">Separate multiple areas with commas</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className={`w-full p-3 border border-slate-200 rounded-xl h-32 ${editing ? 'bg-white' : 'bg-slate-50'}`}
                                placeholder="Tell students about yourself..."
                                disabled={!editing}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-2">LinkedIn Profile</label>
                            <input
                                type="url"
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                className={`w-full p-3 border border-slate-200 rounded-xl ${editing ? 'bg-white' : 'bg-slate-50'}`}
                                placeholder="https://linkedin.com/in/yourprofile"
                                disabled={!editing}
                            />
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Mentorship Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-indigo-50 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</p>
                                <p className="text-sm text-slate-600">Students Mentored</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                                <p className="text-2xl font-bold text-purple-600">{stats.totalFeedback}</p>
                                <p className="text-sm text-slate-600">Feedback Given</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{stats.rating.toFixed(1)}</p>
                                <p className="text-sm text-slate-600">Average Rating</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{new Date(user.createdAt).getFullYear()}</p>
                                <p className="text-sm text-slate-600">Member Since</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
