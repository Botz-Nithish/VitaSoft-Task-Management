import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../api/auth.api';
import { loginSuccess } from '../features/auth/authSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// Abstract Document / Checklist Concept SVG for the right panel
const ChecklistConceptSVG = () => (
  <svg viewBox="0 0 200 200" className="w-[80%] max-w-sm drop-shadow-2xl">
    {/* Background board */}
    <rect x="50" y="30" width="100" height="140" rx="6" fill="#1a2535" stroke="#00c48c" strokeWidth="2" opacity="0.9" />
    
    {/* Lines representing tasks */}
    <rect x="70" y="60" width="60" height="8" rx="4" fill="#ffffff" opacity="0.3" />
    <rect x="70" y="90" width="60" height="8" rx="4" fill="#ffffff" opacity="0.3" />
    <rect x="70" y="120" width="40" height="8" rx="4" fill="#ffffff" opacity="0.3" />
    <rect x="70" y="150" width="50" height="8" rx="4" fill="#ffffff" opacity="0.3" />
    
    {/* Floating checkmarks / dots */}
    <circle cx="45" cy="64" r="12" fill="#00c48c" opacity="0.8" />
    <circle cx="45" cy="94" r="12" fill="#00c48c" opacity="0.8" />
    <circle cx="45" cy="124" r="12" fill="#00c48c" opacity="0.4" />
    <circle cx="45" cy="154" r="12" fill="#00c48c" opacity="0.4" />
    
    {/* Small checkmarks inside circles */}
    <path d="M40 64 L44 68 L50 60" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 94 L44 98 L50 90" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Decorative accents */}
    <circle cx="150" cy="160" r="25" fill="#14b8a6" opacity="0.2" />
    <circle cx="170" cy="50" r="10" fill="#00c48c" opacity="0.5" />
    <path d="M140 40 L160 20" stroke="#00c48c" strokeWidth="2" opacity="0.5" strokeDasharray="4 4" />
  </svg>
);

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    setIsLoading(true);
    try {
      const user = await register({ name, email, password });
      dispatch(loginSuccess(user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message?.[0] || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#0d1f2d]">
      
      {/* Left Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white dark:bg-[#1a2535]">
        <div className="max-w-md w-full mx-auto">
          {/* Logo Placeholder */}
          <div className="flex items-center space-x-2 mb-12">
            <img src="/logo.svg" alt="TaskSphere Logo" className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">TaskSphere</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create an account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Join the platform to organize your life's work.</p>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Elon Musk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full py-3 mt-6" isLoading={isLoading}>
              CREATE ACCOUNT
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account? <Link to="/login" className="font-semibold text-[#00c48c] hover:underline">Sign in</Link>
          </p>
        </div>
        
        <div className="mt-auto pt-12 items-center text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} TaskSphere. All rights reserved.</span>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex lg:flex-1 bg-[#0b1f1f] flex-col items-center justify-center relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#00c48c]/10 to-transparent"></div>
        <div className="absolute top-1/2 left-[-10%] w-[400px] h-[400px] rounded-full bg-[#00c48c]/5 blur-[100px] -translate-y-1/2"></div>
        
        <figure className="relative z-10 w-full flex justify-center mb-12">
          <ChecklistConceptSVG />
        </figure>
        
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-[#00c48c]/10 border border-[#00c48c]/20">
            <span className="w-2 h-2 rounded-full bg-[#00c48c] mr-2 animate-pulse"></span>
            <span className="text-[#00c48c] text-xs font-bold tracking-widest uppercase">SECURE_WORKSPACE</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Master Your<br/>Daily Execution.</h3>
          <p className="text-gray-400 text-lg">
            Track progress, hit targets, and stay organized in an environment built for focus.
          </p>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
