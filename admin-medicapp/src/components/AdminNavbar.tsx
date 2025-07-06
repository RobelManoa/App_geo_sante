import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import './AdminNavbar.css';

const AdminNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      path: "/admin",
      label: "Tableau de bord",
      icon: "📊",
      description: "Vue d'ensemble"
    },
    {
      path: "/admin/prestataires",
      label: "Prestataires",
      icon: "🏥",
      description: "Gestion des prestataires"
    },
    {
      path: "/admin/ajouter",
      label: "Ajouter",
      icon: "➕",
      description: "Nouveau prestataire"
    },
    {
      path: "/admin/users",
      label: "Utilisateurs",
      icon: "👥",
      description: "Gestion des utilisateurs"
    }
  ];

  return (
    <>
      <nav className={`admin-navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <div className="logo-icon">🏥</div>
            <div className="logo-text">
              <span className="logo-title">MedicApp</span>
              <span className="logo-subtitle">Administration</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                <div className="nav-tooltip">
                  <span className="tooltip-text">{item.description}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="navbar-user">
            <div className="user-info">
              <div className="user-avatar">👨‍⚕️</div>
              <div className="user-details">
                <span className="user-name">Administrateur</span>
                <span className="user-role">Super Admin</span>
              </div>
            </div>
            
            <Link to="/" className="logout-btn" onClick={closeMobileMenu}>
              <span className="logout-icon">🚪</span>
              <span className="logout-text">Déconnexion</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">👨‍⚕️</div>
              <div className="mobile-user-details">
                <span className="mobile-user-name">Administrateur</span>
                <span className="mobile-user-role">Super Admin</span>
              </div>
            </div>
          </div>
          
          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <div className="mobile-nav-content">
                  <span className="mobile-nav-label">{item.label}</span>
                  <span className="mobile-nav-description">{item.description}</span>
                </div>
              </Link>
            ))}
            
            <Link to="/" className="mobile-logout-link" onClick={closeMobileMenu}>
              <span className="mobile-logout-icon">🚪</span>
              <span className="mobile-logout-text">Déconnexion</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu}></div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
};

export default AdminNavbar;
