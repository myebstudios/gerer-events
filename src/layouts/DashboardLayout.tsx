import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { LogOut, Calendar, Plus, QrCode, Settings } from 'lucide-react';
import { Button } from '@heroui/react';
import { getStoredUserId } from '../lib/id';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const userId = getStoredUserId();

  const user = useQuery((api as any).auth.getUser, userId ? { userId } : "skip");

  useEffect(() => {
    const checkUser = () => {
      if (!userId) {
        navigate('/login');
      }
      setLoading(false);
    };
    checkUser();
  }, [navigate, userId]);

  const handleSignOut = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><div className="animate-pulse text-text-muted font-medium">Loading...</div></div>;

  const navItems = [
    { to: '/dashboard', icon: <Calendar className="h-4 w-4" />, label: 'My Events', exact: true },
    { to: '/dashboard/events/new', icon: <Plus className="h-4 w-4" />, label: 'Create Event' },
    { to: '/dashboard/tools/quick-qr', icon: <QrCode className="h-4 w-4" />, label: 'Quick QR' },
    { to: '/dashboard/settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'Host';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen md:h-screen bg-gray-50 text-black antialiased md:overflow-hidden">
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-black">Gerer Events</Link>
        <Button variant="light" isIconOnly onPress={() => setMobileNavOpen((v) => !v)} aria-label="Toggle navigation">
          <span className="material-symbols-outlined">{mobileNavOpen ? 'close' : 'menu'}</span>
        </Button>
      </div>

      <div className="flex md:h-screen">
      {/* Sidebar */}
      <aside className={`${mobileNavOpen ? 'block' : 'hidden'} md:flex w-full md:w-64 bg-white border-r border-gray-100 flex-col z-20 md:z-10 md:static fixed inset-x-0 top-[57px] bottom-0`}>
        <div className="p-6 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-display text-2xl font-bold tracking-tight text-black">Gerer Events</span>
          </Link>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 px-3">Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.to, item.exact)
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-[#18181B] text-white flex items-center justify-center font-display font-bold text-sm shadow-sm">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
          <Button
            onPress={handleSignOut}
            variant="light"
            className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50 font-medium text-sm"
            startContent={<LogOut className="h-4 w-4" />}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
