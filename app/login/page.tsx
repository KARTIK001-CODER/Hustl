'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.data.token) {
                    localStorage.setItem('auth_token', data.data.token);
                }

                // Store user data
                if (data.data.user) {
                    localStorage.setItem('user', JSON.stringify(data.data.user));

                    // Redirect based on role
                    const role = data.data.user.role;
                    if (role === 'ADMIN') {
                        router.push('/admin/dashboard');
                    } else if (role === 'MENTOR') {
                        router.push('/mentor/dashboard');
                    } else if (role === 'STUDENT') {
                        router.push('/student/dashboard');
                    } else {
                        router.push('/');
                    }
                } else {
                    router.push('/');
                }
            } else {
                console.error('Login failed:', data);
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Network error during login.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        setIsLoading(true);
        // Simulate OAuth delay
        setTimeout(() => {
            const mockUser = {
                id: 'mock-123',
                fullName: `Hustle ${provider} User`,
                email: `user@${provider.toLowerCase()}.com`,
                role: 'STUDENT',
                roleData: {
                    university: 'Global Tech University',
                    major: 'Computer Science',
                    graduationYear: '2026'
                }
            };
            localStorage.setItem('auth_token', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(mockUser));
            router.push('/student/dashboard');
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#F4F1DE] flex items-center justify-center p-6">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-hustl-teal/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-hustl-terracotta/5 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
                {/* Left Side - Branding & Info */}
                <div className="hidden lg:block">
                    <div className="space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-hustl-terracotta rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">H</span>
                            </div>
                            <span className="text-3xl font-bold text-hustl-charcoal">
                                HUSTL
                            </span>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold text-hustl-charcoal leading-tight">
                                Welcome back to your
                                <span className="block mt-2 text-hustl-terracotta">
                                    career journey
                                </span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Track applications, get mentor feedback, and land your dream internship—all in one place.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { icon: '🎯', text: 'Track unlimited internship applications' },
                                { icon: '💬', text: 'Get structured mentor feedback' },
                                { icon: '📊', text: 'Monitor your progress in real-time' },
                                { icon: '🚀', text: 'Convert feedback into actionable tasks' }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                                        <span className="text-xl">{item.icon}</span>
                                    </div>
                                    <p className="text-slate-700 font-medium">{item.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-full bg-hustl-teal border-4 border-white"
                                    ></div>
                                ))}
                            </div>
                            <div>
                                <p className="font-semibold text-hustl-charcoal">500+ Students</p>
                                <p className="text-sm text-slate-600">Already hustling smart</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 lg:p-10">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-hustl-terracotta rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-2xl font-bold text-hustl-charcoal">
                                HUSTL
                            </span>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-hustl-charcoal mb-2">Sign In</h2>
                            <p className="text-slate-600">
                                Don't have an account?{' '}
                                <Link href="/signup" className="text-hustl-terracotta hover:text-hustl-terracotta/80 font-semibold">
                                    Sign up
                                </Link>
                            </p>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleSocialLogin('Google')}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => handleSocialLogin('GitHub')}
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

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-hustl-charcoal mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-hustl-teal focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-hustl-charcoal mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-hustl-teal bg-slate-50 border-slate-300 rounded focus:ring-2 focus:ring-hustl-teal"
                                    />
                                    <span className="text-sm text-slate-700">Remember me</span>
                                </label>

                                <Link href="/forgot-password" university-cta="true" className="text-sm font-semibold text-hustl-teal hover:text-hustl-teal/80">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-hustl-teal text-white font-semibold rounded-xl hover:shadow-lg hover:bg-hustl-teal/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-center text-sm text-slate-600">
                                By signing in, you agree to our{' '}
                                <Link href="/terms" className="text-hustl-teal hover:text-hustl-teal/80 font-medium">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="/privacy" className="text-hustl-teal hover:text-hustl-teal/80 font-medium">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}