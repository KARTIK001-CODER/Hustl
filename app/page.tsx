import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  MessageSquare,
  Target,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  LayoutDashboard
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F1DE] selection:bg-hustl-terracotta/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-hustl-terracotta rounded-xl flex items-center justify-center transform hover:rotate-6 transition-transform">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="text-2xl font-bold text-hustl-charcoal tracking-tight">
                HUSTL
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-hustl-charcoal hover:text-hustl-teal font-semibold transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="px-6 py-2.5 bg-hustl-teal text-white rounded-xl font-semibold hover:shadow-lg hover:bg-hustl-teal/90 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-hustl-teal/5 rounded-full border border-hustl-teal/10">
                <div className="w-2 h-2 bg-hustl-terracotta rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-hustl-teal uppercase tracking-wider">
                  Your Career Journey, Unified
                </span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-extrabold text-hustl-charcoal leading-[1.1] tracking-tight">
                Stop juggling tabs.
                <span className="block mt-2 text-hustl-terracotta">
                  Start hustling smart.
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
                Track internships, manage mentor feedback, and convert insights into action—all from one powerful dashboard. Built for students who mean business.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/signup" className="px-10 py-5 bg-hustl-teal text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:bg-hustl-teal/95 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                  Get Started Now
                  <TrendingUp className="w-6 h-6" />
                </Link>
                <Link href="/login" university-cta="true" className="px-10 py-5 bg-white text-hustl-charcoal rounded-2xl font-bold text-xl border-2 border-gray-200 hover:border-hustl-terracotta hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                  View Dashboard
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Or join with</span>
                <div className="flex gap-4">
                  <Link href="/signup" className="p-3 bg-white border border-gray-200 rounded-xl hover:border-hustl-teal hover:shadow-md transition-all group">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </Link>
                  <Link href="/signup" className="p-3 bg-white border border-gray-200 rounded-xl hover:border-hustl-charcoal hover:shadow-md transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-12 h-12 rounded-full border-4 border-[#F4F1DE] ${i === 1 ? 'bg-hustl-teal' :
                      i === 2 ? 'bg-hustl-terracotta' :
                        i === 3 ? 'bg-hustl-charcoal' : 'bg-slate-400'
                      }`}></div>
                  ))}
                </div>
                <div>
                  <p className="text-lg font-bold text-hustl-charcoal">500+ Students</p>
                  <p className="text-sm text-slate-600 font-medium">Already hustling smart</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-hustl-teal/5 rounded-[3rem] blur-3xl transform -rotate-6"></div>
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10 overflow-hidden group">
                {/* Decorative Dots */}
                <div className="absolute top-0 right-0 p-4 grid grid-cols-4 gap-2 opacity-20">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-hustl-terracotta rounded-full"></div>
                  ))}
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-xl font-bold text-hustl-charcoal">Application Pipeline</h3>
                      <p className="text-sm text-slate-500 font-medium">Spring 2024 Cycle</p>
                    </div>
                    <div className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
                      12 Active
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { label: 'Applied', count: 8, progress: 'w-4/5', color: 'bg-hustl-teal', light: 'bg-hustl-teal/10' },
                      { label: 'Interview', count: 3, progress: 'w-1/2', color: 'bg-hustl-terracotta', light: 'bg-hustl-terracotta/10' },
                      { label: 'Offer', count: 1, progress: 'w-1/4', color: 'bg-green-600', light: 'bg-green-50' }
                    ].map((status, i) => (
                      <div key={status.label} className="group/item">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-hustl-charcoal">{status.label}</span>
                          <span className="text-sm font-extrabold text-slate-400">{status.count}</span>
                        </div>
                        <div className={`w-full ${status.light} rounded-full h-3 overflow-hidden`}>
                          <div className={`h-full ${status.color} ${status.progress} rounded-full transition-all duration-1000 group-hover:opacity-90`}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-hustl-sandstone flex items-center justify-center text-hustl-teal">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">New Feedback</p>
                        <p className="text-sm font-bold text-hustl-charcoal">3 Actionable Insights</p>
                      </div>
                    </div>
                    <button className="p-3 bg-hustl-teal/5 text-hustl-teal rounded-xl hover:bg-hustl-teal hover:text-white transition-all">
                      <Zap className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-32 px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-hustl-terracotta/10 rounded-full border border-hustl-terracotta/20 mb-10">
            <span className="text-xs font-bold text-hustl-terracotta uppercase tracking-[0.2em]">The Chaos</span>
          </div>

          <h2 className="text-5xl lg:text-6xl font-black text-hustl-charcoal mb-8 tracking-tighter leading-tight">
            Your journey shouldn't feel like a mess.
          </h2>

          <p className="text-2xl text-slate-500 leading-relaxed mb-16 font-medium max-w-3xl mx-auto">
            Spreadsheets break. Emails get lost. Opportunities vanish. We built HUSTL to solve the internship headache once and for all.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: MessageSquare, title: 'Scattered Feedback', desc: 'No more digging through Slack or Email to find what your mentor said.' },
              { icon: Target, title: 'Zero Visibility', desc: 'Instantly know where every application stands without manual tracking.' },
              { icon: Clock, title: 'Ghosted/Forgotten', desc: 'Automatic reminders ensure you never miss a crucial follow-up.' }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-hustl-sandstone/30 rounded-3xl border border-gray-100 text-left hover:border-hustl-terracotta/20 transition-all">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-hustl-terracotta shadow-sm mb-6">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-hustl-charcoal mb-3">{item.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-hustl-teal/10 rounded-full border border-hustl-teal/20 mb-8">
                <span className="text-xs font-bold text-hustl-teal uppercase tracking-[0.2em]">The Platform</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-hustl-charcoal tracking-tight leading-[1] mb-6">
                Everything you need to land it.
              </h2>
            </div>
            <p className="text-xl text-slate-500 font-medium lg:max-w-md">
              A unified command center for students, mentors, and administrators. Seamless, powerful, and fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: 'Smart Tracker', desc: 'Log and track applications with custom statuses and real-time updates.' },
              { icon: MessageSquare, title: 'Mentor Sync', desc: 'Direct feedback loop between you and your mentors for faster growth.' },
              { icon: TrendingUp, title: 'Growth Analytics', desc: 'Visualize your progress and identify areas for improvement instantly.' },
              { icon: ShieldCheck, title: 'Role-Based Flow', desc: 'Custom tailored experiences for students, mentors, and admins.' },
              { icon: LayoutDashboard, title: 'Insights Central', desc: 'Turn data into actionable tasks with our proprietary logic engine.' },
              { icon: Zap, title: 'Instant Alerts', desc: 'Real-time notifications for feedback, status changes, and deadlines.' }
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 bg-hustl-sandstone/50 rounded-2xl flex items-center justify-center text-hustl-teal mb-8 group-hover:bg-hustl-teal group-hover:text-white transition-colors duration-500">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-hustl-charcoal mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Switcher */}
      <section className="py-20 px-6 lg:px-8 bg-hustl-charcoal text-white rounded-[4rem] mx-6 lg:mx-8 mb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-hustl-teal rounded-full blur-[120px] opacity-20 -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-hustl-terracotta rounded-full blur-[120px] opacity-10 -ml-48 -mb-48"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight">Built for the whole ecosystem.</h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">Different views, same goal: Student success.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { role: 'For Students', icon: '🎓', color: 'bg-hustl-teal', desc: 'Land your dream role with structured tracking and expert guidance.' },
              { role: 'For Mentors', icon: '👨‍🏫', color: 'bg-hustl-terracotta', desc: 'Maximize your impact with streamlined feedback tools.' },
              { role: 'For Admins', icon: '⚙️', color: 'bg-slate-700', desc: 'Manage your program with enterprise-grade oversight.' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-3xl group hover:bg-white/10 transition-all cursor-default">
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.role}</h3>
                <p className="text-slate-400 leading-relaxed mb-8">{item.desc}</p>
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((tick) => (
                    <div key={tick} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-hustl-terracotta" />
                      <span>{i === 0 ? ['Track Unlimited Apps', 'Direct Feedback', 'Smart Alerts'][tick - 1] :
                        i === 1 ? ['Easy Feedback', 'Mentee Trends', 'Progress Maps'][tick - 1] :
                          ['User Controls', 'Cycle Analytics', 'Custom Workflows'][tick - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-hustl-terracotta rounded-[3rem] p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl shadow-hustl-terracotta/20">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 L100 100 M100 0 L0 100" stroke="white" strokeWidth="0.1" fill="none" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter">Ready to hustl?</h2>
              <p className="text-xl lg:text-2xl text-white/90 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                Join 500+ students already using HUSTL to bridge the gap between application and offer.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/signup" className="px-12 py-6 bg-hustl-charcoal text-white rounded-2xl font-black text-2xl hover:bg-black hover:scale-105 transition-all shadow-xl">
                  Get Started Free
                </Link>
                <Link href="/login" className="px-12 py-6 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-2xl font-black text-2xl hover:bg-white/20 transition-all">
                  Sign In
                </Link>
              </div>
              <p className="mt-10 text-white/60 text-sm font-bold tracking-widest uppercase">No credit card required • Student-first pricing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hustl-sandstone py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-hustl-terracotta rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl font-mono">H</span>
                </div>
                <span className="text-3xl font-black text-hustl-charcoal tracking-tighter uppercase">HUSTL</span>
              </div>
              <p className="text-xl text-slate-500 font-medium max-w-sm leading-relaxed">
                The unified platform for the next generation of professionals. Bridge the gap between search and success.
              </p>
            </div>
            <div>
              <h4 className="font-black text-hustl-charcoal uppercase tracking-widest text-sm mb-8">Product</h4>
              <ul className="space-y-4 font-bold text-slate-400">
                <li><Link href="/student/dashboard" className="hover:text-hustl-terracotta transition-colors">Dashboard</Link></li>
                <li><Link href="/signup" className="hover:text-hustl-terracotta transition-colors">Features</Link></li>
                <li><Link href="/login" className="hover:text-hustl-terracotta transition-colors">Log In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-hustl-charcoal uppercase tracking-widest text-sm mb-8">Social</h4>
              <ul className="space-y-4 font-bold text-slate-400">
                <li><a href="#" className="hover:text-hustl-terracotta transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-hustl-terracotta transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-hustl-terracotta transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 font-bold">© 2024 HUSTL Platform. Built for the future.</p>
            <div className="flex gap-8 font-bold text-slate-400">
              <Link href="#" className="hover:text-hustl-charcoal transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-hustl-charcoal transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}