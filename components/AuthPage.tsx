
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Apple, Mail, Phone, ArrowRight, User } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    const userData = { 
      name: name || 'User', 
      provider, 
      email, 
      phone,
      type: isLogin ? 'Login' : 'Signup'
    };

    try {
      // Notify admin via backend
      await fetch('/api/auth/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
    }

    // Simulate login delay
    setTimeout(() => {
      onLogin(userData);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (phone.length >= 10 || email.includes('@')) {
        handleSocialLogin('Credentials');
      }
    } else {
      if (name && (phone.length >= 10 || email.includes('@'))) {
        handleSocialLogin('Credentials');
      }
    }
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const AppleIcon = () => (
    <svg viewBox="0 0 384 512" className="w-5 h-5" fill="currentColor">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-6"
            >
              <span className="text-white font-black text-2xl">EZ</span>
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join the Zone'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? 'Enter your details to access your sanctuary' : 'Create an account to start your journey'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative group"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading || (isLogin ? (!phone && !email) : (!name || (!phone && !email)))}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 disabled:opacity-50 disabled:hover:from-indigo-500 disabled:hover:to-violet-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                <span className="bg-white px-4 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => handleSocialLogin('Google')}
                className="flex items-center justify-center py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all hover:scale-105 active:scale-95"
                title="Google"
              >
                <GoogleIcon />
              </button>
              <button 
                onClick={() => handleSocialLogin('Apple')}
                className="flex items-center justify-center py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all hover:scale-105 active:scale-95"
                title="Apple"
              >
                <div className="text-black">
                  <AppleIcon />
                </div>
              </button>
              <button 
                onClick={() => handleSocialLogin('GitHub')}
                className="flex items-center justify-center py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all hover:scale-105 active:scale-95 text-slate-900"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </button>
            </div>

            {/* Guest Login */}
            <button 
              onClick={() => handleSocialLogin('Guest')}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-900 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Continue as Guest
            </button>
          </div>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-400 hover:text-indigo-600 text-sm font-bold transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          By continuing, you agree to our <span className="text-slate-500">Terms</span> & <span className="text-slate-500">Privacy</span>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
