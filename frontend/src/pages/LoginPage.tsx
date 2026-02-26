import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../api/auth.api';
import { loginSuccess } from '../features/auth/authSlice';
import { startTransition } from '../features/ui/transitionSlice';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import uiText from '../data.json';

// Decorative generic floating blocks SVG for the right panel
const GeometricBlocksSVG = () => (
  <svg viewBox="0 0 200 200" className="w-[80%] max-w-sm drop-shadow-2xl">
    <rect x="40" y="40" width="60" height="60" rx="8" fill="#00c48c" opacity="0.9" />
    <rect x="90" y="80" width="80" height="80" rx="8" fill="#14b8a6" opacity="0.6" />
    <rect x="30" y="110" width="50" height="50" rx="8" fill="#ffffff" opacity="0.2" />
    <circle cx="150" cy="50" r="20" fill="#00c48c" opacity="0.4" />
    <path d="M50 160 L180 30" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="5,5" />
    <path d="M20 100 L160 180" stroke="#00c48c" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
  </svg>
);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    try {
      const user = await login({ email, password });
      
      // Start fullscreen animation overlay immediately
      dispatch(startTransition('LOGIN'));
      
      // Wait for the overlay to fully cover the screen (400ms) before authenticating
      // This prevents React Router from instantly unmounting the LoginPage
      setTimeout(() => {
        dispatch(loginSuccess(user));
        navigate('/');
      }, 400);

    } catch (err: any) {
      setError(err.response?.data?.message?.[0] || err.response?.data?.message || 'Invalid credentials.');
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
            <img src="/logo.svg" alt={`${uiText.app.name} Logo`} className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{uiText.app.name}</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{uiText.auth.login.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{uiText.auth.login.subtitle}</p>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={uiText.auth.login.emailLabel}
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <div>
              <Input
                label={uiText.auth.login.passwordLabel}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-2">
                <a href="#" className="text-sm font-medium text-[#00c48c] hover:text-[#00a878]">
                  {uiText.auth.login.forgotPassword}
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 mt-4" isLoading={isLoading}>
              {uiText.auth.login.submitButton}
            </Button>
          </form>

          <div className="mt-8 flex items-center">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-4 text-xs text-gray-400 font-medium tracking-wider uppercase">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <Button variant="secondary" className="py-2.5 font-semibold text-sm">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.761h-9.426z" />
              </svg>
              Google
            </Button>
            <Button variant="secondary" className="py-2.5 font-semibold text-sm">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </Button>
          </div>
          
          <p className="mt-8 text-center text-sm text-gray-500">
            {uiText.auth.login.noAccountText} <Link to="/register" className="font-semibold text-[#00c48c] hover:underline">{uiText.auth.login.noAccountLink}</Link>
          </p>
        </div>
        
        <div className="mt-auto pt-12 items-center text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} {uiText.app.name}. All rights reserved.</span>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href="#" className="hover:text-gray-600 dark:hover:text-gray-300">Terms of Service</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:flex lg:flex-1 bg-[#0b1f1f] flex-col items-center justify-center relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00c48c]/10 to-transparent"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00c48c]/5 blur-[120px]"></div>
        
        <figure className="relative z-10 w-full flex justify-center mb-12">
          <GeometricBlocksSVG />
        </figure>
        
        <div className="relative z-10 text-center px-12 max-w-lg">
          <div className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-[#00c48c]/10 border border-[#00c48c]/20">
            <span className="w-2 h-2 rounded-full bg-[#00c48c] mr-2 animate-pulse"></span>
            <span className="text-[#00c48c] text-xs font-bold tracking-widest uppercase">SYSTEM_READY</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Precision Engineering<br/>for your Workflow.</h3>
          <p className="text-gray-400 text-lg">
            Secure, scalable, and beautifully designed task management for focused execution.
          </p>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
