'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Internship {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
    location: string;
    type: string;
    duration: string;
    salary?: string;
    applicationDeadline?: string;
    startDate?: string;
    isActive: boolean;
    createdAt: string;
    _count?: {
        applications: number;
    };
}

export default function AdminInternshipsPage() {
    const router = useRouter();
    const [internships, setInternships] = useState<Internship[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: '',
        skills: '',
        location: '',
        type: 'REMOTE',
        duration: '',
        salary: '',
        applicationDeadline: '',
        startDate: ''
    });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('auth_token');

        if (!userData || !token) {
            router.push('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'ADMIN') {
            router.push('/login');
            return;
        }

        fetchInternships();
    }, [router]);

    const fetchInternships = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch('/api/internships', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setInternships(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch internships:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('auth_token');

        const payload = {
            ...formData,
            requirements: formData.requirements.split('\n').filter(r => r.trim()),
            skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
        };

        try {
            const response = await fetch('/api/internships', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchInternships();
                setShowAddModal(false);
                setFormData({
                    title: '',
                    company: '',
                    description: '',
                    requirements: '',
                    skills: '',
                    location: '',
                    type: 'REMOTE',
                    duration: '',
                    salary: '',
                    applicationDeadline: '',
                    startDate: ''
                });
            }
        } catch (error) {
            console.error('Failed to create internship:', error);
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`/api/internships/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (response.ok) {
                fetchInternships();
            }
        } catch (error) {
            console.error('Failed to update internship:', error);
        }
    };

    const deleteInternship = async (id: string) => {
        if (!confirm('Are you sure you want to delete this internship?')) return;

        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`/api/internships/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchInternships();
            }
        } catch (error) {
            console.error('Failed to delete internship:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40">
            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">H</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                HUSTL Admin
                            </h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</Link>
                            <Link href="/admin/users" className="text-slate-600 hover:text-slate-900">Users</Link>
                            <Link href="/admin/internships" className="text-slate-900 font-medium">Internships</Link>
                            <Link href="/admin/analytics" className="text-slate-600 hover:text-slate-900">Analytics</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Internships</h1>
                        <p className="text-slate-600">Post and manage internship listings</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
                    >
                        + Post Internship
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-lg text-slate-600">Loading internships...</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {internships.map(internship => (
                            <div key={internship.id} className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-slate-900">{internship.title}</h3>
                                            <button
                                                onClick={() => toggleStatus(internship.id, internship.isActive)}
                                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${internship.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {internship.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                        <p className="text-slate-600 font-medium mb-2">{internship.company}</p>
                                        <div className="flex flex-wrap gap-3 mb-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {internship.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {internship.type}
                                            </span>
                                            {internship.duration && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {internship.duration}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {internship._count?.applications || 0} applications
                                            </span>
                                        </div>
                                        <p className="text-slate-700 mb-4 line-clamp-2">{internship.description}</p>
                                        {internship.skills && internship.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {internship.skills.slice(0, 6).map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {internship.skills.length > 6 && (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                                        +{internship.skills.length - 6} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <span>Posted: {new Date(internship.createdAt).toLocaleDateString()}</span>
                                            {internship.applicationDeadline && (
                                                <span>Deadline: {new Date(internship.applicationDeadline).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => deleteInternship(internship.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {internships.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <p className="text-slate-600 font-medium">No internships posted yet</p>
                                <p className="text-sm text-slate-500 mt-1">Click "Post Internship" to add your first listing</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Internship Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 overflow-y-auto">
                        <div className="bg-white rounded-xl p-8 max-w-2xl w-full my-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Post New Internship</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Job Title *</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Company *</label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">Requirements (one per line)</label>
                                    <textarea
                                        value={formData.requirements}
                                        onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Bachelor's degree in Computer Science&#10;2+ years experience"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">Skills (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="React, Node.js, TypeScript"
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Location *</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Type *</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            required
                                        >
                                            <option value="REMOTE">Remote</option>
                                            <option value="HYBRID">Hybrid</option>
                                            <option value="ONSITE">On-site</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">Duration</label>
                                        <input
                                            type="text"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder="3 months"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
                                    >
                                        Post Internship
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
