import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar = ({ searchQuery, onSearchChange }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll effect
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-red-600 hover:text-red-500 transition-colors">
              FILOFLIX
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-white hover:text-gray-300 transition-colors">Home</Link>
              <Link to="/content?type=movie" className="text-white hover:text-gray-300 transition-colors">Movies</Link>
              <Link to="/content?type=series" className="text-white hover:text-gray-300 transition-colors">TV Shows</Link>
              <Link to="/content?type=trailer" className="text-white hover:text-gray-300 transition-colors">Trailers</Link>
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64 bg-black/50 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5 text-white" />
            </Button>
            <Link to="/admin/login">
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5 text-white" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
