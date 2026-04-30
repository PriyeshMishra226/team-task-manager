import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users, Layout, CheckCircle2, ArrowRight } from 'lucide-react';

const Landing = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: 'Kanban Boards',
      description: 'Visualize your work with drag-and-drop boards to track tasks from todo to done.',
      icon: Layout,
    },
    {
      title: 'Team Collaboration',
      description: 'Invite members to your projects, assign tasks, and keep everyone on the same page.',
      icon: Users,
    },
    {
      title: 'Progress Tracking',
      description: 'Monitor project health with real-time metrics and overdue task highlights.',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2 text-brand-600">
              <Briefcase className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight text-surface-900">TaskFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-surface-600 hover:text-surface-900 font-medium px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-surface-900 tracking-tight mb-8">
              Manage your team's work in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">one place</span>
            </h1>
            <p className="text-xl text-surface-600 mb-10 leading-relaxed">
              TaskFlow helps teams organize projects, track tasks, and collaborate effectively. Everything you need to get work done, beautifully designed.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/signup" className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center text-lg">
                Get started for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-surface-200 hover:border-brand-300 transition-colors group">
                  <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 mb-3">{feature.title}</h3>
                  <p className="text-surface-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-surface-500">
          <div className="flex items-center justify-center space-x-2 text-surface-400 mb-4">
            <Briefcase className="w-6 h-6" />
            <span className="text-xl font-bold text-surface-300">TaskFlow</span>
          </div>
          <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
