import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '../ui/button';
import { LogOut, LayoutDashboard } from 'lucide-react';

export default function PosLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/pos" className="text-xl font-bold text-primary">
              ORIXA POS
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
