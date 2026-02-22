'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentNavbar from '@/app/components/StudentNavbar';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'STUDENT' | 'MENTOR' | 'ADMIN';
    roleData?: {
        university?: string;
        major?: string;
        graduationYear?: string;
        skills?: string[];
        resume?: string;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        university: '',
        major: '',
        graduationYear: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Initialize form data
        setFormData({
            fullName: parsedUser.fullName || '',
            university: parsedUser.roleData?.university || '',
            major: parsedUser.roleData?.major || '',
            graduationYear: parsedUser.roleData?.graduationYear || ''
        });

        setLoading(false);
    }, [router]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setMessage('');

        try {
            const token = localStorage.getItem('auth_token');

            // In a real implementation, you would call PUT /api/users/[id]
            // For now, we'll just update localStorage
            const updatedUser = {
                ...user,
                fullName: formData.fullName,
                roleData: {
                    ...user.roleData,
                    university: formData.university,
                    major: formData.major,
                    graduationYear: formData.graduationYear
                }
            };

            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditing(false);
            setMessage('Profile updated successfully!');

            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
            setMessage('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!user) return;

        // Reset form data
        setFormData({
            fullName: user.fullName || '',
            university: user.roleData?.university || '',
            major: user.roleData?.major || '',
            graduationYear: user.roleData?.graduationYear || ''
        });

        setEditing(false);
        setMessage('');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-hustl-sandstone">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-hustl-teal"></div>
                    <p className="mt-4 text-lg font-bold text-hustl-charcoal tracking-tight">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-hustl-sandstone selection:bg-hustl-terracotta/20">
            {/* Navigation */}
            <StudentNavbar user={user} />

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <Link href="/student/dashboard" className="text-hustl-teal hover:text-hustl-teal/80 font-bold mb-6 inline-flex items-center gap-2 uppercase tracking-widest text-xs transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Control Center
                    </Link>
                    <h1 className="text-4xl font-black text-hustl-charcoal mt-4 mb-3 tracking-tight">Identity & Vision 👤</h1>
                    <p className="text-slate-500 text-xl font-medium">Manage your personal professional profile</p>
                </div>

                {/* Success Message */}
                {message && (
                    <div className={`mb-8 p-6 rounded-2xl font-bold transition-all ${message.includes('success')
                        ? 'bg-green-50 text-green-700 border-2 border-green-100 shadow-lg shadow-green-500/5'
                        : 'bg-red-50 text-red-700 border-2 border-red-100 shadow-lg shadow-red-500/5'
                        }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full animate-ping ${message.includes('success') ? 'bg-green-500' : 'bg-red-500'}`} />
                            {message}
                        </div>
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-hustl-teal p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-white via-transparent to-black rounded-full mix-blend-overlay" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-32 h-32 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <span className="text-5xl font-black text-hustl-teal">
                                    {user.fullName ? user.fullName.charAt(0) : 'S'}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{user.fullName || 'Student'}</h2>
                            <p className="text-hustl-sandstone/70 font-medium text-lg mb-4">{user.email}</p>
                            <span className="inline-block px-6 py-2 bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-white/20">
                                {user.role}
                            </span>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="p-12">
                        <div className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Full Name */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal/50 transition-all font-bold text-slate-700 ${editing
                                            ? 'bg-white border-gray-100'
                                            : 'bg-slate-50 border-transparent text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-400 font-bold cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* University */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                        University
                                    </label>
                                    <input
                                        type="text"
                                        name="university"
                                        value={formData.university}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        placeholder="e.g., Stanford University"
                                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal/50 transition-all font-bold text-slate-700 ${editing
                                            ? 'bg-white border-gray-100'
                                            : 'bg-slate-50 border-transparent text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                {/* Graduation Year */}
                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                        Class Year
                                    </label>
                                    <input
                                        type="text"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleInputChange}
                                        disabled={!editing}
                                        placeholder="e.g., 2025"
                                        className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal/50 transition-all font-bold text-slate-700 ${editing
                                            ? 'bg-white border-gray-100'
                                            : 'bg-slate-50 border-transparent text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Major */}
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                                    Core Discipline
                                </label>
                                <input
                                    type="text"
                                    name="major"
                                    value={formData.major}
                                    onChange={handleInputChange}
                                    disabled={!editing}
                                    placeholder="e.g., Computer Science"
                                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-hustl-teal/10 focus:border-hustl-teal/50 transition-all font-bold text-slate-700 ${editing
                                        ? 'bg-white border-gray-100'
                                        : 'bg-slate-50 border-transparent text-slate-400 cursor-not-allowed'
                                        }`}
                                />
                            </div>

                            {/* Skills Section */}
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Expertise Deck</h3>
                                    <span className="px-3 py-1 bg-hustl-terracotta/10 text-hustl-terracotta text-[10px] font-black uppercase tracking-widest rounded-full">Coming Soon</span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 opacity-40">
                                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                                        <p className="text-slate-400 font-bold text-sm text-center">Skill Mapping Interface</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.5rem]">
                                        <p className="text-slate-400 font-bold text-sm text-center">Portfolio Linkages</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-12 flex flex-col md:flex-row gap-4">
                            {!editing ? (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="flex-1 bg-hustl-teal text-white font-black py-5 rounded-2xl hover:shadow-2xl hover:bg-hustl-teal/90 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 group"
                                >
                                    <span>Edit Credentials</span>
                                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-[2] bg-hustl-teal text-white font-black py-5 rounded-2xl hover:shadow-2xl hover:bg-hustl-teal/90 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? 'Synchronizing...' : 'Save Updates'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
