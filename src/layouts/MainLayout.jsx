import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
        
        {/* Institutional Footer */}
        <footer className="py-4 px-6 border-t border-slate-200/80 text-center text-xs text-slate-500 bg-white/50">
          <p>© 2026 Academic Task Management System • Digitized Role-Based Workflow System</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
