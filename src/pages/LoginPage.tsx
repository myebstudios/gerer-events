import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button, Input, Card, CardBody, Alert } from '@heroui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const signUp = useMutation((api as any).auth.signUp);
  const signIn = useMutation((api as any).auth.signIn);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userId = await signUp({ email, password });
        localStorage.setItem('userId', userId);
        navigate('/dashboard');
      } else {
        const userId = await signIn({ email, password });
        localStorage.setItem('userId', userId);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="antialiased overflow-x-hidden bg-ivory text-espresso min-h-screen flex">
      {/* Left Side - Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img alt="Elegant table setting" className="w-full h-full object-cover opacity-90" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdBGOj9vyl0NyCrDZwV0UiYjfaUvZqVr2prIGw4SyD3bEfx7FNUnJJ2kaG3We75eO5w5MSQDifgs7hFbAB0MtCNSSzKoBEBNlcs_7o7OismSEGyr_eeSoNdsSFNCp2f5BeBDAtjojqr5gWoRy37vwH528dnBmXBOibNiWOx0-cnUDgV-a5KwymlTfTFUrB6jvQgkqMezRQdt3-hTsiOp5g1PatsUDJZEoi1IHhXnsgajm-vace261JVnTRUnWe1TkVREkjHNeZw7PN"/>
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 inline-flex">
            <span className="material-symbols-outlined text-gold text-4xl">diamond</span>
            <span className="font-serif text-2xl text-ivory tracking-widest uppercase">Gerer</span>
          </Link>
        </div>
        
        <div className="relative z-10 max-w-md">
          <p className="text-gold text-sm uppercase tracking-widest mb-4 font-bold">Host Portal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-ivory mb-6 leading-tight">
            Command Your Event
          </h1>
          <p className="text-ivory/80 text-lg font-light leading-relaxed">
            Access real-time analytics, manage guest lists, and curate memories from your exclusive gatherings.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-ivory relative">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gold text-3xl">diamond</span>
            <span className="font-serif text-xl text-espresso tracking-widest uppercase">Gerer</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="font-serif text-3xl md:text-4xl text-espresso mb-3">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-clay text-sm">
              {isSignUp ? 'Enter your details to start planning your event.' : 'Enter your credentials to access your dashboard.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-espresso/70">Email Address</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onValueChange={setEmail}
                variant="bordered"
                radius="sm"
                isRequired
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-espresso/70">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs text-gold hover:text-clay transition-colors">Forgot Password?</a>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onValueChange={setPassword}
                variant="bordered"
                radius="sm"
                isRequired
              />
            </div>
            
            <Button
              type="submit"
              isDisabled={loading}
              color="primary"
              className="w-full mt-8 font-bold tracking-widest uppercase"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-sm text-espresso/60">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-gold hover:text-clay font-bold uppercase tracking-wider text-xs transition-colors"
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
