import { Bell, Search, TrendingUp, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: '首页', path: '/' },
  { label: '流水', path: '/transactions' },
  { label: '预算', path: '/budget' },
  { label: '账单', path: '/recurring' },
  { label: '日历', path: '/calendar' },
  { label: '统计', path: '/statistics' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        data-cmp="Navbar"
        className="fixed top-0 left-0 right-0 z-50 glass-navbar shadow-navbar"
        style={{ height: '64px' }}
      >
        <div className="page-container h-full flex items-center px-4 md:px-6 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 gradient-blue rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-sm md:text-base tracking-tight">财务追踪</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side - actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
              <Search size={18} />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors text-muted-foreground">
              <User size={18} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden ml-auto w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-16 right-0 bottom-0 w-64 z-50 glass-navbar shadow-lg transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-4 gap-2">
          {/* Mobile icons */}
          <div className="flex items-center gap-2 pb-4 mb-2 border-b border-border">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground">
              <Search size={20} />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors text-muted-foreground">
              <User size={20} />
            </button>
          </div>

          {navLinks.map(link => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
