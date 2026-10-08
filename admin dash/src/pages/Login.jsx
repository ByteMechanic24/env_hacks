import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from 'aws-amplify/auth';
import { ShieldAlert, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('sentinel_authed') === 'true') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await signIn({ username, password });
      
      if (response.isSignedIn || response.nextStep?.signInStep === 'DONE') {
        localStorage.setItem('sentinel_authed', 'true');
        navigate('/dashboard');
      } else {
        // If there's an unexpected next step or challenge
        if (response.nextStep?.signInStep) {
          setError(`Challenge required: ${response.nextStep.signInStep}`);
        } else {
          localStorage.setItem('sentinel_authed', 'true');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020817] radar-grid px-4 py-8 overflow-hidden">
      {/* Ambient background glow for high-tech aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Top right tactical status indicator */}
      <div className="absolute top-5 right-6 hidden sm:flex items-center gap-2 text-[11px] font-mono tracking-wider text-[#475569]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        DEFCON 1 // SYS_ID: AP-SOUTH-1
      </div>

      {/* Main Login Card */}
      <div
        className="relative z-10 w-full max-w-[420px] shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: '#0d1424',
          border: '1px solid #1e3a5f',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 25px 50px -12px rgba(2, 8, 23, 0.9), 0 0 30px rgba(30, 58, 95, 0.35)'
        }}
      >
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 mb-3 rounded-full bg-blue-950/40 border border-[#1e3a5f]">
            <ShieldAlert className="w-5 h-5 text-blue-400" />
          </div>

          <h1
            className="text-white text-3xl sm:text-4xl glow-sentinel select-none"
            style={{
              fontWeight: 900,
              letterSpacing: '0.15em',
            }}
          >
            SENTINEL
          </h1>

          <p
            className="mt-2.5 uppercase font-medium select-none"
            style={{
              color: '#475569',
              fontSize: '11px',
              letterSpacing: '0.3em',
            }}
          >
            EMERGENCY COMMAND INTERFACE
          </p>
        </div>

        {/* Thin horizontal divider */}
        <div
          className="my-6 w-full"
          style={{
            height: '1px',
            backgroundColor: '#1e3a5f',
          }}
        />

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 font-medium uppercase"
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                letterSpacing: '0.1em',
              }}
            >
              Operator ID / Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator credential"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition duration-200 outline-none pr-10"
                style={{
                  backgroundColor: '#020817',
                  border: '1px solid #1e3a5f',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#1e3a5f')}
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium uppercase"
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                letterSpacing: '0.1em',
              }}
            >
              Security Key / Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition duration-200 outline-none pr-10"
                style={{
                  backgroundColor: '#020817',
                  border: '1px solid #1e3a5f',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#1e3a5f')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#94a3b8] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-white transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#1d4ed8',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>INITIALIZE SESSION</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="text-xs text-center font-medium mt-3 px-2 py-1.5 rounded bg-red-950/30 border border-red-900/50 break-words"
              style={{
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}
        </form>

        {/* Footer Text */}
        <p
          className="text-center font-semibold uppercase mt-6 select-none"
          style={{
            color: '#334155',
            fontSize: '10px',
            letterSpacing: '0.15em',
          }}
        >
          AUTHORIZED PERSONNEL ONLY
        </p>
      </div>
    </div>
  );
}
