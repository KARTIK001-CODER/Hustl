'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AnalyticsMetric {
    value: number;
    growth: number;
}

interface AnalyticsData {
    totalUsers: AnalyticsMetric;
    activeApplications: AnalyticsMetric;
    feedbackGiven: AnalyticsMetric;
    conversionRate: AnalyticsMetric;
}

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<AnalyticsData>({
        totalUsers: { value: 0, growth: 0 },
        activeApplications: { value: 0, growth: 0 },
        feedbackGiven: { value: 0, growth: 0 },
        conversionRate: { value: 0, growth: 0 }
    });
    const [timeRange, setTimeRange] = useState('30');
    const [loading, setLoading] = useState(true);

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

        fetchAnalytics();
    }, [router, timeRange]);

    const fetchAnalytics = async () => {
        const token = localStorage.getItem('auth_token');
        try {
            const response = await fetch(`/api/admin/analytics?days=${timeRange}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMetrics(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const getGrowthColor = (growth: number) => {
        return growth >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getGrowthIcon = (growth: number) => {
        return growth >= 0 ? '↑' : '↓';
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
                            <Link href="/admin/internships" className="text-slate-600 hover:text-slate-900">Internships</Link>
                            <Link href="/admin/analytics" className="text-slate-900 font-medium">Analytics</Link>
                            <button onClick={handleLogout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Analytics</h1>
                        <p className="text-slate-600">Usage statistics and insights</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">All time</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-lg text-slate-600">Loading analytics...</p>
                    </div>
                ) : (
                    <>
                        {/* Key Metrics */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Total Users</p>
                                <h3 className="text-3xl font-bold text-slate-900 mb-2">{metrics.totalUsers.value}</h3>
                                <p className={`text-sm font-semibold ${getGrowthColor(metrics.totalUsers.growth)}`}>
                                    {getGrowthIcon(metrics.totalUsers.growth)} {Math.abs(metrics.totalUsers.growth)}% vs previous period
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Active Applications</p>
                                <h3 className="text-3xl font-bold text-slate-900 mb-2">{metrics.activeApplications.value}</h3>
                                <p className={`text-sm font-semibold ${getGrowthColor(metrics.activeApplications.growth)}`}>
                                    {getGrowthIcon(metrics.activeApplications.growth)} {Math.abs(metrics.activeApplications.growth)}% vs previous period
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Feedback Given</p>
                                <h3 className="text-3xl font-bold text-slate-900 mb-2">{metrics.feedbackGiven.value}</h3>
                                <p className={`text-sm font-semibold ${getGrowthColor(metrics.feedbackGiven.growth)}`}>
                                    {getGrowthIcon(metrics.feedbackGiven.growth)} {Math.abs(metrics.feedbackGiven.growth)}% vs previous period
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60 hover:shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Conversion Rate</p>
                                <h3 className="text-3xl font-bold text-slate-900 mb-2">{metrics.conversionRate.value}%</h3>
                                <p className={`text-sm font-semibold ${getGrowthColor(metrics.conversionRate.growth)}`}>
                                    {getGrowthIcon(metrics.conversionRate.growth)} {Math.abs(metrics.conversionRate.growth)}% vs previous period
                                </p>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
                                    <span className="text-sm text-slate-500">Trend over time</span>
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-purple-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <p className="text-slate-500 font-medium">Chart Visualization</p>
                                        <p className="text-sm text-slate-400 mt-1">Integrate Chart.js or Recharts</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Application Status</h3>
                                    <span className="text-sm text-slate-500">Distribution</span>
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-dashed border-blue-200">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-blue-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                        <p className="text-slate-500 font-medium">Pie/Donut Chart</p>
                                        <p className="text-sm text-slate-400 mt-1">Status breakdown visualization</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Top Companies</h3>
                                    <span className="text-sm text-slate-500">By applications</span>
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-200">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-green-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <p className="text-slate-500 font-medium">Bar Chart</p>
                                        <p className="text-sm text-slate-400 mt-1">Most popular companies</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900">Mentor Activity</h3>
                                    <span className="text-sm text-slate-500">Top performers</span>
                                </div>
                                <div className="h-64 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-dashed border-indigo-200">
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-indigo-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-slate-500 font-medium">Activity Chart</p>
                                        <p className="text-sm text-slate-400 mt-1">Feedback distribution</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Export Options */}
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200/60">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Export Options</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <button className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-red-300 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-semibold text-slate-900">Export as PDF</span>
                                    </div>
                                    <p className="text-sm text-slate-600">Download full analytics report</p>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-green-300 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="font-semibold text-slate-900">Export as CSV</span>
                                    </div>
                                    <p className="text-sm text-slate-600">Download raw data</p>
                                </button>

                                <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-lg transition border-2 border-transparent hover:border-blue-300 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-semibold text-slate-900">Schedule Reports</span>
                                    </div>
                                    <p className="text-sm text-slate-600">Automated email reports</p>
                                </button>
                            </div>
                        </div>

                        {/* Insights Summary */}
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-xl shadow-lg text-white mt-6">
                            <h3 className="text-2xl font-bold mb-4">Platform Insights</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold mb-2">📈 Growth Trends</h4>
                                    <p className="text-purple-100">
                                        User registrations are {metrics.totalUsers.growth >= 0 ? 'up' : 'down'} {Math.abs(metrics.totalUsers.growth)}%
                                        compared to the previous period. {metrics.totalUsers.growth >= 0 ? 'Great momentum!' : 'Focus on user acquisition.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">🎯 Conversion Performance</h4>
                                    <p className="text-purple-100">
                                        {metrics.conversionRate.value}% of applications result in offers.
                                        {metrics.conversionRate.growth >= 0 ? ' Conversion is improving!' : ' Consider improving application quality.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">💬 Engagement</h4>
                                    <p className="text-purple-100">
                                        Mentors have provided {metrics.feedbackGiven.value} pieces of feedback,
                                        {metrics.feedbackGiven.growth >= 0 ? ' showing strong engagement.' : ' engagement could be improved.'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">📊 Activity Level</h4>
                                    <p className="text-purple-100">
                                        {metrics.activeApplications.value} applications submitted in this period.
                                        Platform activity is {metrics.activeApplications.growth >= 0 ? 'increasing' : 'decreasing'}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
