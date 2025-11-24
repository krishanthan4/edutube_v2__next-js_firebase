'use client';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiBookOpen, 
  FiFolder, 
  FiBarChart, 
  FiFile,
  FiLogOut,
  FiSettings
} from 'react-icons/fi';

export default function AdminNavbar() {
  const auth = useAuth();
  const { logout, user } = auth;
  const userProfile = (auth as any).userProfile; // Temporary fix
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/users', label: 'Users', icon: FiUsers },
    { href: '/admin/courses', label: 'Courses', icon: FiBookOpen },
    { href: '/admin/categories', label: 'Categories', icon: FiFolder },
    { href: '/admin/guidances', label: 'Guidances', icon: FiFile },
    { href: '/admin/pathways', label: 'Pathways', icon: FiBarChart },
    { href: '/admin/analytics', label: 'Analytics', icon: FiBarChart },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              Edutube Admin
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {userProfile?.displayName || userProfile?.email}
            </span>
            <Link 
              href="/admin/settings"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiSettings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}