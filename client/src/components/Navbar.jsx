import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'nav-scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          <Shield className="logo-icon" size={32} />
          <span>Fraud<span>Shield</span></span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
          <Link to="/security" className={location.pathname === '/security' ? 'active' : ''}>Security</Link>
          <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link>
          <Link to="/report" className="btn-primary nav-cta">Report Fraud</Link>
        </div>
      </div>
      
      <style>{`
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .logo-icon { color: var(--primary); }
        .logo span span { color: var(--primary); }
        
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-links a:not(.btn-primary) {
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }
        .nav-links a:not(.btn-primary):hover, .nav-links a.active {
          color: var(--text-main);
        }
        .nav-cta {
          padding: 0.6rem 1.4rem !important;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .nav-links a:not(.btn-primary) { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
