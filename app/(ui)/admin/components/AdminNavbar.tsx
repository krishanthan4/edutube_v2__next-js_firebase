'use client';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  FiHome, 
  FiUsers, 
  FiBookOpen, 
  FiFolder, 
  FiBarChart, 
  FiFile,
  FiLogOut,
  FiSettings,
  FiMenu,
  FiX,
  FiChevronRight,
  FiChevronLeft
} from 'react-icons/fi';

export default function AdminSidebar() {
  const auth = useAuth();
  const { logout, user } = auth;
  const userProfile = (auth as any).userProfile;
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    { href: '/admin/guidances', label: 'Guidances', icon: FiFile },
    { href: '/admin/pathways', label: 'Pathways', icon: FiBarChart },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-black text-white transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <Link href="/admin" className="text-xl font-semibold">
              Edutube Admin
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => isMobile && setIsCollapsed(true)}
                >
                  <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-4">
          {!isCollapsed && (
            <div className="mb-4">
              <div className="text-sm font-medium text-white truncate">
                {userProfile?.displayName || 'Admin User'}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {userProfile?.email}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-red-900 text-gray-400 hover:text-white group relative`}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <FiLogOut className={`w-4 h-4 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!isCollapsed && <span>Logout</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {isMobile && isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-lg lg:hidden"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}