import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Image, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  User, 
  Building2, 
  Target
} from 'lucide-react';

interface RegisterProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'editor' | 'dashboard') => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designPurpose, setDesignPurpose] = useState('Personal Use');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, fullName, companyName, designPurpose, isSubscribed);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-transparent px-4 py-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 my-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-brand-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm mt-1">Get started with your design studio</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name input */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white rounded-lg placeholder-slate-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white rounded-lg placeholder-slate-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white rounded-lg placeholder-slate-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Company Name (Optional) */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Company Name <span className="text-[10px] text-slate-500">(Optional)</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Building2 className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white rounded-lg placeholder-slate-600 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Design Purpose (Dropdown selector) */}
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1.5">Design Purpose</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Target className="w-4 h-4" />
              </span>
              <select
                value={designPurpose}
                onChange={(e) => setDesignPurpose(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-white rounded-lg outline-none transition-all text-sm cursor-pointer"
              >
                <option value="Personal Use">Personal / Hobbyist</option>
                <option value="Professional Designer">Professional Designer</option>
                <option value="Content Marketer">Content Marketer</option>
                <option value="Business Owner">Business Owner / B2B</option>
              </select>
            </div>
          </div>

          {/* Start with Premium Trial */}
          <div className="p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-3 mt-1">
            <input
              type="checkbox"
              id="subscribe"
              checked={isSubscribed}
              onChange={(e) => setIsSubscribed(e.target.checked)}
              className="mt-1.5 w-4 h-4 text-brand-600 bg-slate-950 border-slate-800 rounded focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="subscribe" className="cursor-pointer select-none">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 fill-violet-400 animate-pulse" />
                Pre-activate Paid Premium Account
              </div>
              <p className="text-slate-400 text-[10px] mt-0.5 leading-normal">
                Bypasses the 1-day free trial constraints and starts your account as a permanent Premium member.
              </p>
            </label>
          </div>

          {/* Terms and Conditions checkbox */}
          <div className="flex items-start gap-2.5 px-1 py-1">
            <input
              type="checkbox"
              id="accept-terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-brand-600 bg-slate-950 border-slate-800 rounded focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="accept-terms" className="cursor-pointer select-none text-[11px] text-slate-400 leading-normal">
              I agree to the <a href="#" className="text-brand-400 hover:underline">Terms of Service</a> and <a href="#" className="text-brand-400 hover:underline">Privacy Policy</a>. All new signups automatically start with a <span className="text-brand-300 font-bold">1-day free trial</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-brand-600 to-violet-650 hover:from-brand-500 hover:to-violet-550 active:from-brand-700 active:to-violet-750 text-white font-semibold rounded-lg transition-all shadow-lg shadow-brand-500/10 cursor-pointer disabled:opacity-50 text-sm mt-3"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-450">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-400 hover:text-brand-300 font-bold transition-colors cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
