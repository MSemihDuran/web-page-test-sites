import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { CanvasEditor } from './components/CanvasEditor';
import { NeonBackground } from './components/NeonBackground';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'editor';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setInitialDimensions] = useState<{ width: number; height: number } | null>(null);

  // Sync auth state to navigation routing
  React.useEffect(() => {
    if (!loading) {
      if (user) {
        if (page === 'login' || page === 'register') {
          setPage('dashboard');
        }
      } else {
        if (page === 'dashboard' || page === 'editor') {
          setPage('login');
        }
      }
    }
  }, [user, loading, page]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#020617] text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mb-4"></div>
        <span className="text-sm font-semibold">Loading Canvas Studio...</span>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (page) {
      case 'landing':
        return <Landing onNavigate={setPage} />;
      case 'login':
        return <Login onNavigate={setPage} />;
      case 'register':
        return <Register onNavigate={setPage} />;
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setPage} 
            setSelectedProjectId={setSelectedProjectId}
            setInitialDimensions={setInitialDimensions}
          />
        );
      case 'editor':
        if (!selectedProjectId) {
          setPage('dashboard');
          return null;
        }
        return (
          <CanvasEditor 
            projectId={selectedProjectId} 
            onBack={() => {
              setSelectedProjectId(null);
              setPage('dashboard');
            }}
          />
        );
      default:
        return <Landing onNavigate={setPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 relative overflow-x-hidden">
      {/* Dynamic Animated Neon Lines Background */}
      <NeonBackground />

      {/* Global Profile & Settings Modal */}
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Shared Persistent Navbar (hidden inside Canvas Editor studio) */}
      {page !== 'editor' && (
        <Navbar currentPage={page} onNavigate={setPage} onOpenProfile={() => setProfileOpen(true)} />
      )}

      {/* Page Content Container */}
      <div className="flex-1 flex flex-col relative z-10">
        {renderActivePage()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
