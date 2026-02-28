import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import '../styles/Navbar.css';

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
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>B2B Console</Link>
          <Link to="/report" className="btn-primary nav-cta">Report Fraud</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
