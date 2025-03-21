import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, Heart, Pill } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Medications', path: '/add-medication' },
    { name: 'Profile', path: '/profile' },
  ];

  // Add Dear Ones Portal link to dropdown menu
  const handleDearOnesPortal = () => {
    navigate('/dear-ones-portal');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3",
        isScrolled ? "bg-blue-700 shadow-md" : "bg-blue-600 backdrop-blur-md"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2"
            aria-label="MindfulMeds home"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MindfulMeds</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "px-5 py-2 rounded-lg transition-colors text-base",
                  isActive(link.path) 
                    ? "text-blue-700 font-medium bg-white" 
                    : "text-white hover:text-blue-100 hover:bg-blue-500"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:text-blue-100 hover:bg-blue-500 h-10 w-10"
                  aria-label="Notifications"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full text-white hover:text-blue-100 hover:bg-blue-500 h-10 w-10"
                      aria-label="User profile"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDearOnesPortal} className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Dear Ones Portal
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-white hover:bg-blue-50 text-blue-700 px-6 py-2 text-base"
              >
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500 text-white" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div 
          className={cn(
            "md:hidden fixed inset-x-0 top-[60px] p-4 bg-blue-700 shadow-lg border-t border-blue-500 transition-all duration-300 ease-in-out",
            isMobileMenuOpen 
              ? "translate-y-0 opacity-100" 
              : "-translate-y-full opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={cn(
                  "px-4 py-3 rounded-lg transition-colors text-lg",
                  isActive(link.path) 
                    ? "text-blue-700 font-medium bg-white" 
                    : "text-white hover:text-blue-100 hover:bg-blue-500"
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link 
              to="/notifications" 
              className="px-4 py-3 rounded-lg transition-colors text-lg text-white hover:text-blue-100 hover:bg-blue-500"
            >
              Notifications
            </Link>
            <Link 
              to="/dear-ones-portal"
              className={cn(
                "px-4 py-3 rounded-lg transition-colors flex items-center text-lg",
                isActive('/dear-ones-portal') 
                  ? "text-blue-700 font-medium bg-white" 
                  : "text-white hover:text-blue-100 hover:bg-blue-500"
              )}
            >
              <Heart className="h-4 w-4 mr-2" />
              Dear Ones Portal
            </Link>
            <div className="pt-2 border-t border-blue-500 mt-2">
              {currentUser ? (
                <Button 
                  className="w-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" 
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button 
                  className="w-full bg-white hover:bg-blue-50 text-blue-700" 
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
