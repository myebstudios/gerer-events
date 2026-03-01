import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Plus, Settings } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
      }
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-ivory">Loading...</div>;

  return (
    <div className="flex h-screen bg-soft-surface text-espresso antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-ivory border-r border-gold/20 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 border-b border-gold/10">
          <Link to="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gold text-3xl">diamond</span>
            <span className="font-serif text-xl tracking-widest uppercase">Gerer</span>
          </Link>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-clay mb-4">Menu</p>
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-espresso text-ivory' : 'text-espresso/70 hover:bg-gold/10 hover:text-espresso'}`}
            >
              <Calendar className="h-4 w-4" />
              My Events
            </Link>
            <Link
              to="/dashboard/events/new"
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/dashboard/events/new' ? 'bg-espresso text-ivory' : 'text-espresso/70 hover:bg-gold/10 hover:text-espresso'}`}
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-gold/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-espresso text-gold flex items-center justify-center font-serif italic">
              A
            </div>
            <div>
              <p className="text-sm font-bold">Host Account</p>
              <p className="text-xs text-clay">Pro Plan</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-espresso/70 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-soft-surface">
        <Outlet />
      </main>
    </div>
  );
}
