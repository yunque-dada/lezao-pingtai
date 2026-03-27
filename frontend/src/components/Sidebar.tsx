import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
}

interface MenuItem {
  key: string;
  icon: string;
  label: string;
  path: string;
  roles?: string[];
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const menuItems: MenuItem[] = useMemo(() => {
    const role = user?.role;

    if (role === 'teacher') {
      return [
        { key: 'dashboard', icon: '🏠', label: '工作台', path: '/teacher/dashboard' },
        { key: 'courses', icon: '📚', label: '课程管理', path: '/teacher/courses' },
        { key: 'students', icon: '👨‍🎓', label: '学生管理', path: '/teacher/students' },
        { key: 'works', icon: '🎨', label: '作品管理', path: '/teacher/works' },
        { key: 'scratch-projects', icon: '🎮', label: 'Scratch作品', path: '/teacher/scratch-projects' },
        { key: 'scratch-editor', icon: '✏️', label: '新建Scratch3.0', path: '/student/scratch/editor/new' },
      ];
    }

    if (role === 'student') {
      return [
        { key: 'dashboard', icon: '🏠', label: '学习中心', path: '/student/dashboard' },
        { key: 'courses', icon: '📚', label: '课程中心', path: '/student/courses' },
        { key: 'my-courses', icon: '📖', label: '我的课程', path: '/student/my-courses' },
        { key: 'works', icon: '🎨', label: '作品中心', path: '/student/works' },
        { 
          key: 'my-works', 
          icon: '✨', 
          label: '我的作品', 
          path: '/student/my-works',
          children: [
            { key: 'scratch-projects', icon: '🎮', label: 'Scratch作品', path: '/student/scratch-projects' },
            { key: 'scratch-editor', icon: '✏️', label: '新建Scratch3.0', path: '/student/scratch/editor/new' },
          ]
        },
      ];
    }

    if (role === 'admin') {
      return [
        { key: 'dashboard', icon: '🏠', label: '管理后台', path: '/admin/dashboard' },
        {
          key: 'users',
          icon: '👥',
          label: '用户管理',
          path: '',
          children: [
            { key: 'all-users', icon: '👥', label: '全部账户', path: '/admin/users' },
            { key: 'teachers', icon: '👨‍🏫', label: '老师管理', path: '/admin/teachers' },
            { key: 'students', icon: '👨‍🎓', label: '学生管理', path: '/admin/students' },
          ],
        },
        { key: 'courses', icon: '📚', label: '课程管理', path: '/admin/courses' },
        {
          key: 'scratch',
          icon: '🎮',
          label: 'Scratch资源',
          path: '/admin/scratch',
          children: [
            { key: 'scratch-sprites', icon: '👤', label: '角色库', path: '/admin/scratch/sprites' },
            { key: 'scratch-backdrops', icon: '🖼️', label: '背景库', path: '/admin/scratch/backdrops' },
            { key: 'scratch-sounds', icon: '🎵', label: '音乐库', path: '/admin/scratch/sounds' },
            { key: 'scratch-projects', icon: '🎮', label: '作品管理', path: '/admin/scratch/projects' },
            { key: 'scratch-editor', icon: '✏️', label: '新建Scratch3.0', path: '/student/scratch/editor/new' },
          ],
        },
        { key: 'settings', icon: '⚙️', label: '系统设置', path: '/admin/settings' },
      ];
    }

    return [];
  }, [user?.role]);

  const toggleExpand = (key: string) => {
    if (expandedKeys.includes(key)) {
      setExpandedKeys(expandedKeys.filter(k => k !== key));
    } else {
      setExpandedKeys([...expandedKeys, key]);
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      if (!collapsed) {
        toggleExpand(item.key);
      }
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string): boolean => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const active = isActive(item.path);
    const hasChildren = item.children && item.children.length > 0;
    const expanded = expandedKeys.includes(item.key);

    return (
      <div key={item.key} className="menu-item-wrapper">
        <div
          className={`menu-item ${active ? 'active' : ''} ${level > 0 ? 'sub-menu' : ''}`}
          onClick={() => handleMenuClick(item)}
          title={collapsed ? item.label : ''}
        >
          <span className="menu-icon">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="menu-label">{item.label}</span>
              {hasChildren && (
                <span className={`menu-arrow ${expanded ? 'expanded' : ''}`}>▼</span>
              )}
            </>
          )}
        </div>
        {!collapsed && hasChildren && expanded && (
          <div className="menu-children">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-menu">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </div>
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <span>版本 1.0.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
