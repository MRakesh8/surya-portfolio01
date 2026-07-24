import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/admin/Login';
import DashboardLayout from './pages/admin/DashboardLayout';
import DashboardHome from './pages/admin/DashboardHome';
import SectionsList from './pages/admin/SectionsList';
import SectionEditor from './pages/admin/SectionEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import Settings from './pages/admin/Settings';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        {/* Admin Routes with /admin basename */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="pages" element={<SectionsList />} />
          <Route path="pages/:sectionKey" element={<SectionEditor />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
