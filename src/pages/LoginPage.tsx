import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Input } from '@heroui/react';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name || undefined },
            emailRedirectTo: 'https://gerer-events.netlify.app/login',
          },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setNotice('Confirmation email sent. Check your inbox and click the link to verify your account, then sign in here.');
          setIsSignUp(false);
          return;
        }
        if (data.user) navigate('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased overflow-x-hidden bg-white text-black min-h-screen flex selection:bg-gray-100">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#F6F5F2]">
        <div className="absolute inset-0 z-0">
          <img alt="Professional Event" className="w-full h-full object-cover opacity-80" src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&q=80&w=1200" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 inline-flex group">
            <span className="font-display text-2xl text-white tracking-tight font-bold">Gerer Events</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-white/80 text-sm uppercase tracking-widest mb-4 font-bold bg-white/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">Host Portal</p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-6 leading-[1.1] font-medium tracking-tight">
            Command Your Event
          </h1>
          <p className="text-white/90 text-lg font-normal leading-relaxed">
            Beautiful to share, reliable on event day, insightful after the event ends. Log in to manage your events.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl text-black tracking-tight font-bold">Gerer Events</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="font-display text-3xl md:text-4xl text-black mb-3 font-medium tracking-tight">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 text-[15px]">
              {isSignUp ? 'Enter your details to start planning your event.' : 'Enter your credentials to access your dashboard.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {notice && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm text-emerald-700 font-medium">{notice}</p>
              </div>
            )}

            {isSignUp && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-black">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onValueChange={setName}
                  variant="bordered"
                  radius="lg"
                  classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-black">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                radius="lg"
                isRequired
                classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-black">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-gray-500 hover:text-black transition-colors font-medium">Forgot Password?</a>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                radius="lg"
                isRequired
                classNames={{ inputWrapper: "border-gray-200 hover:border-gray-300 focus-within:!border-black shadow-sm" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button type="button" variant="bordered" isDisabled className="h-12 rounded-full font-medium border-gray-200 text-gray-400">
                Google, soon
              </Button>
              <Button type="button" variant="bordered" isDisabled className="h-12 rounded-full font-medium border-gray-200 text-gray-400">
                Facebook, soon
              </Button>
            </div>

            <Button
              type="submit"
              isDisabled={loading}
              className="w-full mt-6 font-medium text-[15px] rounded-full h-12 bg-[#18181B] text-white hover:bg-[#27272A] shadow-md hover:shadow-lg transition-all"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[15px] text-gray-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="ml-2 text-black hover:text-gray-600 font-semibold transition-colors"
                type="button"
              >
                {isSignUp ? 'Sign In' : 'Create One'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
