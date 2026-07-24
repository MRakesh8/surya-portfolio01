import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Image as ImageIcon, Sparkles, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import './Admin.css';

export default function DashboardLayout() {
  const { user, loading, signOut, initializeAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const subscription = initializeAuth();
    return () => {
      subscription?.unsubscribe();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || !user) {
    return <div className="admin-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2><Sparkles size={20} color="#7932ec" /> Scrollz Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/" end className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Visual Builder
          </NavLink>
          <NavLink to="/pages" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Pages & Sections
          </NavLink>
          <NavLink to="/media" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ImageIcon size={18} /> Media Library
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
            Logged in as:<br/>
            <strong style={{color: '#ccc'}}>{user.email}</strong>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#fff' }}>
            Scrollz Studio CMS
          </div>
          <div>
            <a href="/index.html" target="_blank" rel="noreferrer" style={{ color: '#7932ec', textDecoration: 'none', fontSize: '14px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              View Live Website <ExternalLink size={14} />
            </a>
          </div>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
