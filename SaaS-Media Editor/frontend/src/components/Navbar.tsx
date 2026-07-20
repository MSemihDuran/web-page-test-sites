import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentPage: 'landing' | 'login' | 'register' | 'dashboard' | 'editor';
  onNavigate: (page: 'landing' | 'login' | 'register' | 'editor' | 'dashboard') => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenProfile }) => {
  const { user, logout } = useAuth();

  const handleLogoClick = () => {
    if (currentPage !== 'editor') {
      onNavigate('landing');
    }
  };

  return (
    <header className="border-b border-slate-900/60 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 transition-all select-none">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* LOGO - Standing out in solid white for 100% readability */}
        <div 
          onClick={handleLogoClick}
          className={`flex items-center gap-3 ${currentPage !== 'editor' ? 'cursor-pointer' : ''}`}
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
            SaaS Canvas <span className="text-brand-400">MVP</span>
          </span>
        </div>

        {/* Dynamic Navigation Actions */}
        <div className="flex items-center gap-5">
          {/* Dashboard Link if Logged In & on other pages */}
          {user && currentPage !== 'dashboard' && currentPage !== 'editor' && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-slate-350 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              Dashboard
            </button>
          )}

          {/* Authenticated user settings and badges */}
          {user ? (
            <div className="flex items-center gap-4">
              
              {/* Clickable User email and plan badge to trigger Profile Modal */}
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/85 hover:border-brand-500/40 hover:bg-slate-900 px-4 py-1.5 rounded-full text-xs cursor-pointer transition-all active:scale-95 group"
                title="Account Settings & Subscription Details"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-400 transition-colors" />
                <span className="text-slate-300 font-bold max-w-[120px] truncate group-hover:text-white transition-colors">{user.email}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                  user.isSubscribed 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-slate-850 text-slate-400'
                }`}>
                  {user.isSubscribed ? 'Premium' : 'Trial'}
                </span>
              </button>

              {/* Profile Settings shortcut */}
              <button
                onClick={onOpenProfile}
                className="text-slate-450 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
              >
                Settings
              </button>

              {/* Logout */}
              <button 
                onClick={() => { logout(); onNavigate('login'); }}
                className="text-slate-450 hover:text-white p-2 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Unauthenticated actions */
            <div className="flex items-center gap-4">
              {currentPage !== 'login' && (
                <button
                  onClick={() => onNavigate('login')}
                  className="text-slate-450 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
                >
                  Sign In
                </button>
              )}
              {currentPage !== 'register' && (
                <button
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
