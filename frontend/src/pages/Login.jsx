import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';
import { Briefcase, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser(formData);
      login(response.data.data.user, response.data.data.token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      
      // Fallback Demo Login Logic
      if (
        (formData.email === 'admin@test.com' && formData.password === 'Admin@1234') ||
        (formData.email === 'member@test.com' && formData.password === 'Member@1234')
      ) {
        const role = formData.email === 'admin@test.com' ? 'admin' : 'member';
        const fallbackUser = { 
          id: `demo-${role}`, 
          name: role === 'admin' ? 'Admin User' : 'Member User', 
          email: formData.email, 
          role: role 
        };
        
        localStorage.setItem("user", JSON.stringify(fallbackUser));
        localStorage.setItem("isAuthenticated", "true");
        login(fallbackUser, 'demo-token-12345');
        
        toast.success('Logged in using demo credentials');
        navigate('/dashboard');
      } else {
        setError(err.response?.data?.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-surface-100 animate-fade-in">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-2 text-brand-600 mb-6">
            <Briefcase className="w-10 h-10" />
          </Link>
          <h2 className="text-3xl font-bold text-surface-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Email address</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-surface-300 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow sm:text-sm bg-surface-50 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Password</label>
              <input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none block w-full px-4 py-3 border border-surface-300 rounded-xl shadow-sm placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow sm:text-sm bg-surface-50 focus:bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
