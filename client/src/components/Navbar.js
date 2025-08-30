import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Home, Plus, List, BarChart3, Menu, X, Crown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isLibrarian } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) return null;

  const NavLink = ({ to, icon: Icon, children, className = "" }) => (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
        isActive(to)
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-white to-gray-50 shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <BookOpen className="h-8 w-8 text-blue-600 relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Library System
                </span>
                <span className="text-xs text-gray-500">Management Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <NavLink to="/" icon={Home}>Home</NavLink>
            <NavLink to="/books" icon={BookOpen}>Books</NavLink>
            <NavLink to="/borrowings" icon={List}>My Borrowings</NavLink>

            {isLibrarian() && (
              <>
                <NavLink to="/add-book" icon={Plus}>Add Book</NavLink>
                <NavLink to="/all-borrowings" icon={List}>All Borrowings</NavLink>
                <NavLink to="/dashboard" icon={BarChart3}>Dashboard</NavLink>
              </>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-md border border-gray-200">
              <div className="flex items-center space-x-2">
                {isLibrarian() ? (
                  <Crown className="h-4 w-4 text-yellow-500" />
                ) : (
                  <User className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isLibrarian() 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white shadow-lg rounded-b-lg">
            <div className="px-4 py-4 space-y-2">
              <NavLink to="/" icon={Home} className="w-full justify-start">Home</NavLink>
              <NavLink to="/books" icon={BookOpen} className="w-full justify-start">Books</NavLink>
              <NavLink to="/borrowings" icon={List} className="w-full justify-start">My Borrowings</NavLink>

              {isLibrarian() && (
                <>
                  <NavLink to="/add-book" icon={Plus} className="w-full justify-start">Add Book</NavLink>
                  <NavLink to="/all-borrowings" icon={List} className="w-full justify-start">All Borrowings</NavLink>
                  <NavLink to="/dashboard" icon={BarChart3} className="w-full justify-start">Dashboard</NavLink>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    {isLibrarian() ? (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <User className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.username}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isLibrarian() 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
