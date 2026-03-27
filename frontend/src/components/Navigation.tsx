import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

interface NavigationProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getRoleName = () => {
    switch (user?.role) {
      case 'admin':
        return '管理员';
      case 'teacher':
        return '老师';
      case 'student':
        return '学生';
      default:
        return '未知';
    }
  };

  const getRoleClass = () => {
    return user?.role || 'student';
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-left">
        <button 
          className="nav-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          <span className="toggle-icon">{sidebarCollapsed ? '☰' : '✕'}</span>
        </button>
        <div className="nav-brand">
          <span className="brand-icon">🎮</span>
          <span className="brand-text">少儿编程课程平台</span>
        </div>
      </div>

      <div className="nav-center">
        <div className="nav-search">
          <input
            type="text"
            placeholder="搜索课程、作品..."
            className="search-input"
          />
          <button className="search-button">🔍</button>
        </div>
      </div>

      <div className="nav-right">
        <div className="nav-notifications">
          <button className="notification-button">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="nav-user">
          <button 
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <span className="avatar-placeholder">
                  {user?.realName?.[0] || user?.username?.[0] || '?'}
                </span>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.realName || user?.username}</span>
              <span className={`user-role ${getRoleClass()}`}>{getRoleName()}</span>
            </div>
            <span className="user-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <div className="menu-header">
                <div className="menu-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <span className="avatar-placeholder">
                      {user?.realName?.[0] || user?.username?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="menu-user-info">
                  <div className="menu-user-name">{user?.realName || user?.username}</div>
                  <div className="menu-user-email">{user?.email}</div>
                </div>
              </div>
              <div className="menu-divider"></div>
              <button className="menu-item">
                <span className="menu-icon">👤</span>
                <span>个人资料</span>
              </button>
              <button className="menu-item">
                <span className="menu-icon">⚙️</span>
                <span>账号设置</span>
              </button>
              <div className="menu-divider"></div>
              <button className="menu-item logout" onClick={handleLogout}>
                <span className="menu-icon">🚪</span>
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
