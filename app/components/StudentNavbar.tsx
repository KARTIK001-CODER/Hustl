'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { LogOut, LayoutDashboard, UserCircle } from 'lucide-react';

interface StudentNavbarProps {
    user: {
        fullName: string;
        email: string;
        [key: string]: any;
    };
}

export default function StudentNavbar({ user }: StudentNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Dashboard', href: '/student/dashboard' },
        { name: 'Browse', href: '/student/internships' },
        { name: 'Applications', href: '/student/applications' },
        { name: 'Feedback', href: '/student/feedback' },
    ];

    const firstName = user.fullName ? user.fullName.split(' ')[0] : 'Student';
    const initial = firstName.charAt(0);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 no-underline">
                            <div className="w-10 h-10 bg-hustl-terracotta rounded-xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <h1 className="text-2xl font-black text-hustl-charcoal tracking-tighter">HUSTL</h1>
                        </Link>
                        <nav className="hidden md:flex gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`font-bold transition-colors ${pathname === link.href
                                            ? 'text-hustl-teal border-b-2 border-hustl-teal pb-1'
                                            : 'text-slate-500 hover:text-hustl-charcoal'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-5 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-10 h-10 bg-hustl-teal rounded-full flex items-center justify-center text-white font-bold hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none"
                        >
                            {initial}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                                    <p className="text-sm font-black text-hustl-charcoal truncate">{user.fullName}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                                </div>

                                <div className="px-2">
                                    <Link
                                        href="/student/dashboard"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-hustl-teal/5 hover:text-hustl-teal rounded-xl transition-all"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Control Center
                                    </Link>
                                    <Link
                                        href="/student/profile"
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-hustl-teal/5 hover:text-hustl-teal rounded-xl transition-all"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <UserCircle className="w-4 h-4" />
                                        Strategic Profile
                                    </Link>
                                </div>

                                <div className="h-px bg-gray-50 my-2 mx-2" />

                                <div className="px-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-hustl-terracotta hover:bg-hustl-terracotta/5 rounded-xl transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Terminate Session
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
