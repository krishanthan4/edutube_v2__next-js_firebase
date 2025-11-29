'use client';
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HiMenu, HiX, HiUser, HiCog } from 'react-icons/hi';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useAuth();
  const { user, logout } = auth;
  const isAdmin = (auth as any).isAdmin;
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="text-2xl font-bold text-black">
              Edutube
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className={`flex items-center ${ isAdmin && isAdmin() ?  'space-x-1' : ''}`}>
              <Link
                href="/courses/"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
              >
                Courses
              </Link>
                    {user && (<Link
                href="/courses/create"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
              >
                Create Course
              </Link>)}
   {isAdmin && isAdmin() && (                <>
                                   <Link
                    href="/categories/manage"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  >
                    Categories
                  </Link>
               
                    <Link
                      href="/admin"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                    >
                      Admin
                    </Link>
                
                </>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {user ? <></> : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-black/90 hover:bg-black shadow-sm transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-2">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <div className="size-8 rounded-full bg-gray-800 flex items-center justify-center outline -outline-offset-1 outline-white/10">
                    <span className="text-white text-sm font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-sm shadow-gray-500 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 text-sm text-gray-800 ${active ? 'bg-gray-50' : ''} focus:outline-none`}
                      >
                        Profile
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <Link
                        href="/settings"
                        className={`block px-4 py-2 text-sm text-gray-800 ${active ? 'bg-gray-50' : ''} focus:outline-none`}
                      >
                        Settings
                      </Link>
                    )}
                  </MenuItem>
                  <MenuItem>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-800 ${active ? 'bg-gray-50' : ''} focus:outline-none`}
                      >
                        Logout
                      </button>
                    )}
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <HiX className="h-6 w-6" />
              ) : (
                <HiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
          <div className="px-4 pt-2 pb-3 space-y-1">
            <Link
              href="/courses/"
              className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            {user && (
              <>
                <Link
                  href="/courses/create"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Create Course
                </Link>
                <Link
                  href="/categories/manage"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Categories
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                {isAdmin && isAdmin() && (
                  <Link
                    href="/admin"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
            {user ? (
              <div className="pt-4 border-t border-gray-200/50">
                <div className="px-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full mx-4 mb-2 px-4 py-3 rounded-lg text-base font-medium text-white bg-gray-800 hover:bg-gray-900 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200/50 space-y-2">
                <Link
                  href="/auth/login"
                  className="block mx-4 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-black hover:bg-black/5 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block mx-4 mb-2 px-4 py-3 rounded-lg text-base font-medium text-white bg-black/90 hover:bg-black transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}