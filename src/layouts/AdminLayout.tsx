import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarRange, FileBadge2, Shield, LogOut, ScrollText } from 'lucide-react';
import { Button } from '@heroui/react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchCurrentUserAdminState, getAdminEmailFallback } from '../lib/admin';

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;
      if (!user) {
        navigate('/login?next=/admin', { replace: true });
        return;
      }

      try {
        const allowed = await fetchCurrentUserAdminState(user.id);
        setIsAdmin(allowed);
        if (!allowed) {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to verify admin access', error);
        navigate('/dashboard', { replace: true });
        return;
      }

      setLoading(false);
    };

    void checkAdmin();
  }, [authLoading, user, navigate]);

  const navItems = [
    { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, exact: true },
    { to: '/admin/users', label: 'Users', icon: <Users className="h-4 w-4" /> },
    { to: '/admin/events', label: 'Events', icon: <CalendarRange className="h-4 w-4" /> },
    { to: '/admin/contracts', label: 'Contracts', icon: <FileBadge2 className="h-4 w-4" /> },
    { to: '/admin/audit', label: 'Audit Log', icon: <ScrollText className="h-4 w-4" /> },
  ];

  const isActive = (path: string, exact?: boolean) => exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">Loading admin...</div>;

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-black">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-gray-200 bg-white px-5 py-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
              <Shield className="h-3.5 w-3.5" /> Admin
            </div>
            <h1 className="mt-4 font-display text-3xl tracking-tight">Gerer Events</h1>
            <p className="mt-2 text-sm text-gray-500">Platform overview, access control, and operational management.</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${isActive(item.to, item.exact) ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[28px] border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Signed in as</p>
            <p className="mt-3 text-sm font-semibold text-black">{user?.user_metadata?.full_name || getAdminEmailFallback(user)}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          <Button onPress={handleSignOut} variant="light" className="mt-6 w-full justify-start rounded-2xl text-gray-600 hover:bg-red-50 hover:text-red-600" startContent={<LogOut className="h-4 w-4" />}>
            Sign Out
          </Button>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
