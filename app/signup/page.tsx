'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserRole = 'student' | 'mentor' | 'admin' | null;

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        university: '',
        major: '',
        graduationYear: '',
        company: '',
        expertise: '',
        yearsExperience: '',
        organization: '',
        department: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole || !acceptTerms) return;

        setIsLoading(true);

        try {
            const names = formData.fullName.trim().split(' ');
            const firstName = names[0];
            const lastName = names.slice(1).join(' ') || (firstName === 'Admin' ? 'User' : 'Student');

            const basePayload = {
                email: formData.email,
                password: formData.password,
                firstName,
                lastName: lastName || firstName,
                role: selectedRole.toUpperCase(),
            };

            let roleSpecificData = {};

            if (selectedRole === 'student') {
                roleSpecificData = {
                    university: formData.university,
                    major: formData.major,
                    graduationYear: parseInt(formData.graduationYear),
                    skills: [],
                };
            } else if (selectedRole === 'mentor') {
                roleSpecificData = {
                    company: formData.company,
                    expertise: [formData.expertise],
                    yearsExperience: parseInt(formData.yearsExperience) || 0,
                };
            } else if (selectedRole === 'admin') {
                roleSpecificData = {
                    organization: formData.organization,
                    department: formData.department,
                };
            }

            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...basePayload,
                    ...roleSpecificData
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.data.token) {
                    localStorage.setItem('auth_token', data.data.token);
                }

                // Store user data
                if (data.data.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));
                }

                // Redirect based on selected role
                if (selectedRole === 'admin') {
                    router.push('/admin/dashboard');
                } else if (selectedRole === 'mentor') {
                    router.push('/mentor/dashboard');
                } else if (selectedRole === 'student') {
                    router.push('/student/dashboard');
                } else {
                    router.push('/');
                }
            } else {
                alert(data.message || 'Signup failed. Please try again.');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred during signup.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignup = (provider: string) => {
        if (!selectedRole) return;
        setIsLoading(true);
        // Simulate OAuth delay
        setTimeout(() => {
            const mockUser = {
                id: 'mock-123',
                fullName: `Hustle ${provider} User`,
                email: `user@${provider.toLowerCase()}.com`,
                role: selectedRole.toUpperCase(),
                roleData: selectedRole === 'student' ? {
                    university: 'Global Tech University',
                    major: 'Computer Science',
                    graduationYear: '2026'
                } : {}
            };
            localStorage.setItem('auth_token', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(mockUser));

            const path = selectedRole === 'admin' ? '/admin/dashboard' :
                selectedRole === 'mentor' ? '/mentor/dashboard' :
                    '/student/dashboard';

            router.push(path);
            setIsLoading(false);
        }, 1000);
    };

    const roles = [
        {
            type: 'student' as UserRole,
            icon: '🎓',
            title: 'Student',
            description: 'Track applications and get mentor feedback',
            gradient: 'from-hustl-teal to-hustl-teal/80',
            features: ['Track internship applications', 'Receive mentor feedback', 'Access career resources']
        },
        {
            type: 'mentor' as UserRole,
            icon: '👨‍🏫',
            title: 'Mentor',
            description: 'Guide students and provide feedback',
            gradient: 'from-hustl-terracotta to-hustl-terracotta/80',
            features: ['Review student applications', 'Provide structured feedback', 'Track mentee progress']
        },
        {
            type: 'admin' as UserRole,
            icon: '⚙️',
            title: 'Admin',
            description: 'Manage platform and users',
            gradient: 'from-hustl-charcoal to-hustl-charcoal/80',
            features: ['Manage users & permissions', 'Monitor platform analytics', 'Configure workflows']
        }
    ];

    return (
        <div className="min-h-screen bg-[#F4F1DE] flex items-center justify-center p-6">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-hustl-teal/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-hustl-terracotta/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-6xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-hustl-terracotta rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">H</span>
                        </div>
                        <span className="text-3xl font-bold text-hustl-charcoal">
                            HUSTL
                        </span>
                    </Link>
                    <h1 className="text-4xl font-bold text-hustl-charcoal mb-2">
                        {step === 1 ? 'Join HUSTL' : 'Create Your Account'}
                    </h1>
                    <p className="text-slate-600">
                        {step === 1 ? 'Choose your role to get started' : 'Fill in your details to continue'}
                    </p>
                </div>

                {/* Progress Indicator */}
                {step === 2 && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-hustl-terracotta rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    ✓
                                </div>
                                <span className="text-sm font-medium text-hustl-charcoal">Choose Role</span>
                            </div>
                            <div className="w-16 h-1 bg-hustl-teal/20 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-hustl-teal rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    2
                                </div>
                                <span className="text-sm font-medium text-hustl-charcoal">Your Details</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Role Selection */}
                {step === 1 && (
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-3 gap-6">
                            {roles.map((role) => (
                                <button
                                    key={role.type}
                                    onClick={() => handleRoleSelect(role.type)}
                                    className="bg-white rounded-2xl shadow-xl shadow-hustl-teal/5 border-2 border-slate-200/60 p-8 hover:shadow-2xl hover:shadow-hustl-teal/10 hover:border-hustl-terracotta/30 transition-all duration-300 hover:-translate-y-2 text-left group"
                                >
                                    <div className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                                        {role.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{role.title}</h3>
                                    <p className="text-slate-600 mb-6">{role.description}</p>

                                    <ul className="space-y-2">
                                        {role.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                                                <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <div className="flex items-center justify-between text-hustl-teal font-semibold group-hover:text-hustl-terracotta">
                                            <span>Select {role.title}</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-slate-600">
                                Already have an account?{' '}
                                <Link href="/login" className="text-hustl-terracotta hover:text-hustl-terracotta/80 font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Registration Form */}
                {step === 2 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl shadow-hustl-teal/5 border border-slate-200/60 p-8 lg:p-10">
                            {/* Back Button */}
                            <button
                                onClick={() => setStep(1)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to role selection
                            </button>

                            {/* Selected Role Badge */}
                            <div className="flex items-center gap-3 mb-6 p-4 bg-hustl-sandstone/50 rounded-xl border border-hustl-teal/10">
                                <div className="text-3xl">
                                    {roles.find(r => r.type === selectedRole)?.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Signing up as</p>
                                    <p className="font-bold text-hustl-charcoal">
                                        {roles.find(r => r.type === selectedRole)?.title}
                                    </p>
                                </div>
                            </div>

                            {/* Social Signup */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => handleSocialSignup('Google')}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <button
                                    onClick={() => handleSocialSignup('GitHub')}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-hustl-charcoal border-2 border-hustl-charcoal rounded-xl font-medium text-white hover:bg-opacity-90 transition-all duration-300"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Continue with GitHub
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500">Or continue with email</span>
                                </div>
                            </div>

                            {/* Registration Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Common Fields */}
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                {/* Role-specific Fields */}
                                {selectedRole === 'student' && (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="university" className="block text-sm font-semibold text-slate-900 mb-2">
                                                    University
                                                </label>
                                                <input
                                                    type="text"
                                                    id="university"
                                                    name="university"
                                                    value={formData.university}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                    placeholder="Stanford University"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="major" className="block text-sm font-semibold text-slate-900 mb-2">
                                                    Major
                                                </label>
                                                <input
                                                    type="text"
                                                    id="major"
                                                    name="major"
                                                    value={formData.major}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                    placeholder="Computer Science"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="graduationYear" className="block text-sm font-semibold text-slate-900 mb-2">
                                                Expected Graduation Year
                                            </label>
                                            <select
                                                id="graduationYear"
                                                name="graduationYear"
                                                value={formData.graduationYear}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                required
                                            >
                                                <option value="">Select Year</option>
                                                <option value="2025">2025</option>
                                                <option value="2026">2026</option>
                                                <option value="2027">2027</option>
                                                <option value="2028">2028</option>
                                                <option value="2029">2029</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {selectedRole === 'mentor' && (
                                    <>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="company" className="block text-sm font-semibold text-slate-900 mb-2">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    id="company"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                    placeholder="Google"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="expertise" className="block text-sm font-semibold text-slate-900 mb-2">
                                                    Area of Expertise
                                                </label>
                                                <input
                                                    type="text"
                                                    id="expertise"
                                                    name="expertise"
                                                    value={formData.expertise}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                    placeholder="Software Engineering"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="yearsExperience" className="block text-sm font-semibold text-slate-900 mb-2">
                                                Years of Experience
                                            </label>
                                            <select
                                                id="yearsExperience"
                                                name="yearsExperience"
                                                value={formData.yearsExperience}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                required
                                            >
                                                <option value="">Select Range</option>
                                                <option value="1-3">1-3 years</option>
                                                <option value="3-5">3-5 years</option>
                                                <option value="5-10">5-10 years</option>
                                                <option value="10+">10+ years</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {selectedRole === 'admin' && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="organization" className="block text-sm font-semibold text-slate-900 mb-2">
                                                Organization
                                            </label>
                                            <input
                                                type="text"
                                                id="organization"
                                                name="organization"
                                                value={formData.organization}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                placeholder="HUSTL Platform"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-semibold text-slate-900 mb-2">
                                                Department
                                            </label>
                                            <input
                                                type="text"
                                                id="department"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                                placeholder="Platform Operations"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="acceptTerms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="w-5 h-5 text-hustl-teal bg-slate-50 border-slate-300 rounded focus:ring-2 focus:ring-hustl-teal mt-0.5"
                                        required
                                    />
                                    <label htmlFor="acceptTerms" className="text-sm text-slate-700">
                                        I agree to the{' '}
                                        <Link href="/terms" className="text-hustl-teal hover:text-hustl-teal/80 font-medium">
                                            Terms of Service
                                        </Link>{' '}
                                        and{' '}
                                        <Link href="/privacy" className="text-hustl-teal hover:text-hustl-teal/80 font-medium">
                                            Privacy Policy
                                        </Link>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !acceptTerms}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-hustl-terracotta hover:text-hustl-terracotta/80 font-semibold">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}