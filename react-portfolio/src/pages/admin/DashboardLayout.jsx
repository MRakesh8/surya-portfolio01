import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut, Image as ImageIcon, Sparkles } from 'lucide-react';
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
      navigate('/admin/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading || !user) {
    return <div className="admin-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2><Sparkles size={20} color="#9333ea" /> CMS Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/pages" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <FileText size={18} /> Pages & Sections
          </NavLink>
          <NavLink to="/admin/media" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ImageIcon size={18} /> Media Library
          </NavLink>
          <NavLink to="/admin/settings" className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
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
          <div>
            {/* Breadcrumbs or Page Title could go here */}
          </div>
          <div>
            <a href="/" target="_blank" rel="noreferrer" style={{ color: '#9333ea', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              View Live Site ↗
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
