import React, { ReactNode, useState } from 'react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout">
      <Navigation 
        onToggleSidebar={toggleSidebar}
        sidebarCollapsed={sidebarCollapsed}
      />
      <div className="layout-container">
        <Sidebar collapsed={sidebarCollapsed} />
        <main className={`layout-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="layout-content">
            {children}
          </div>
          <footer className="layout-footer">
            <p>© 2026 少儿编程课程平台 - 让编程学习变得简单有趣</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
