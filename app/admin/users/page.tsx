'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'STUDENT' | 'MENTOR' | 'ADMIN';
    createdAt: string;
    isActive?: boolean;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

        fetchUsers();
    }, [router]);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const formattedUsers = data.data.map((u: any) => ({
                    ...u,
                    isActive: u.isActive !== false
                }));
                setUsers(formattedUsers);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'ALL') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(user =>
                statusFilter === 'ACTIVE' ? user.isActive : !user.isActive
            );
        }

        setFilteredUsers(filtered);
    };

    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (response.ok) {
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, isActive: !currentStatus } : u
                ));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const deleteUser = async (userId: string) => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setUsers(users.filter(u => u.id !== userId));
                setDeleteConfirm(null);
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'STUDENT': return 'bg-blue-100 text-blue-700';
            case 'MENTOR': return 'bg-indigo-100 text-indigo-700';
            case 'ADMIN': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
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
                            <Link href="/admin/users" className="text-slate-900 font-medium">Users</Link>
                            <Link href="/admin/internships" className="text-slate-600 hover:text-slate-900">Internships</Link>
                            <Link href="/admin/analytics" className="text-slate-600 hover:text-slate-900">Analytics</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Users</h1>
                        <p className="text-slate-600">View and manage all platform users</p>
                    </div>
                    <Link
                        href="/signup"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition"
                    >
                        + Add User
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200/60 mb-6">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="STUDENT">Students</option>
                                <option value="MENTOR">Mentors</option>
                                <option value="ADMIN">Admins</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="INACTIVE">Inactive Only</option>
                            </select>
                        </div>
                        <div>
                            <button className="w-full p-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition">
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-left">
                                    <input type="checkbox" className="w-4 h-4" />
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700">User</th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700">Role</th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700">Status</th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700">Joined</th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <input type="checkbox" className="w-4 h-4" />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {user.firstName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{user.firstName} {user.lastName}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleUserStatus(user.id, user.isActive || false)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${user.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {loading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <p className="mt-4 text-slate-600">Loading users...</p>
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <p className="text-slate-600 font-medium">No users found</p>
                            <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Confirm Delete</h3>
                            <p className="text-slate-600 mb-6 text-center">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => deleteUser(deleteConfirm)}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
