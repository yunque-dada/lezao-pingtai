import React from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Card, CardGrid, CardMeta, Button } from '../components/common';
import PermissionGuard from '../components/PermissionGuard';
import './Home.css';

const Home: React.FC = () => {
  const { user } = useAuth();

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

  const quickActions = [
    { key: 'courses', icon: '📚', label: '课程中心', path: '/courses', permission: 'course:read' },
    { key: 'works', icon: '🎨', label: '作品管理', path: '/works', permission: 'project:read' },
    { key: 'students', icon: '👨‍🎓', label: '学生管理', path: '/students', permission: 'user:read', roles: ['admin', 'teacher'] },
    { key: 'teachers', icon: '👨‍🏫', label: '老师管理', path: '/teachers', permission: 'user:read', roles: ['admin'] },
  ];

  const stats = [
    { key: 'users', label: '用户总数', value: '128', icon: '👥', color: '#667eea' },
    { key: 'courses', label: '课程总数', value: '36', icon: '📚', color: '#52c41a' },
    { key: 'works', label: '作品总数', value: '256', icon: '🎨', color: '#faad14' },
    { key: 'views', label: '总访问量', value: '1.2k', icon: '👁️', color: '#1890ff' },
  ];

  return (
    <Layout>
      <div className="home-page">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">欢迎回来，{user?.realName || user?.username}！</h1>
            <p className="page-subtitle">今天是学习的好日子，让我们开始吧！</p>
          </div>
          <div className="header-right">
            <span className={`role-badge ${user?.role}`}>{getRoleName()}</span>
          </div>
        </div>

        <div className="stats-section">
          <CardGrid>
            {stats.map(stat => (
              <Card key={stat.key} hoverable>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </CardGrid>
        </div>

        <div className="quick-actions-section">
          <Card title="快速操作">
            <div className="quick-actions">
              {quickActions.map(action => {
                const hasRole = !action.roles || action.roles.includes(user?.role || '');
                return (
                  <PermissionGuard key={action.key} permission={action.permission}>
                    {hasRole && (
                      <div className="action-item">
                        <span className="action-icon">{action.icon}</span>
                        <span className="action-label">{action.label}</span>
                      </div>
                    )}
                  </PermissionGuard>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="content-section">
          <CardGrid>
            <Card 
              title="最近课程" 
              extra={<a href="/courses">查看全部</a>}
              hoverable
            >
              <div className="course-list">
                <div className="course-item">
                  <div className="course-cover">🎮</div>
                  <div className="course-info">
                    <div className="course-title">Scratch入门：创建你的第一个动画</div>
                    <div className="course-meta">
                      <span>12节课</span>
                      <span>1.2k 学习</span>
                    </div>
                  </div>
                </div>
                <div className="course-item">
                  <div className="course-cover">🎯</div>
                  <div className="course-info">
                    <div className="course-title">Scratch进阶：制作小游戏</div>
                    <div className="course-meta">
                      <span>18节课</span>
                      <span>856 学习</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card 
              title="最新作品" 
              extra={<a href="/works">查看全部</a>}
              hoverable
            >
              <div className="work-list">
                <CardMeta
                  avatar={<span>🎮</span>}
                  title="我的第一个游戏"
                  description="小明 · 2小时前"
                />
                <CardMeta
                  avatar={<span>🎨</span>}
                  title="海底世界动画"
                  description="小红 · 5小时前"
                />
                <CardMeta
                  avatar={<span>🎵</span>}
                  title="音乐播放器"
                  description="小刚 · 昨天"
                />
              </div>
            </Card>
          </CardGrid>
        </div>

        <PermissionGuard role="admin">
          <div className="admin-section">
            <Card title="管理员快捷入口">
              <div className="admin-actions">
                <Button variant="primary">用户管理</Button>
                <Button variant="default">系统设置</Button>
                <Button variant="default">资源管理</Button>
                <Button variant="default">数据统计</Button>
              </div>
            </Card>
          </div>
        </PermissionGuard>
      </div>
    </Layout>
  );
};

export default Home;
