import React, { useState, useEffect } from 'react';
import { Card, CardGrid } from '../../components/common';
import statisticsApi from '../../services/statisticsApi';
import './Dashboard.css';

const AdminDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.getDashboardOverview();
      setOverview(data);
    } catch (err: any) {
      setError('获取统计数据失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    }
    return num.toLocaleString();
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    }
    return `${mins}分钟`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>重试</button>
      </div>
    );
  }

  const stats = [
    { key: 'users', label: '用户总数', value: formatNumber(overview?.overview?.totalUsers || 0), icon: '👥', color: '#667eea' },
    { key: 'courses', label: '课程总数', value: formatNumber(overview?.overview?.totalCourses || 0), icon: '📚', color: '#1890ff' },
    { key: 'works', label: '作品总数', value: formatNumber(overview?.overview?.totalProjects || 0), icon: '🎨', color: '#eb2f96' },
    { key: 'studyTime', label: '总学习时长', value: formatTime(overview?.overview?.totalLearningTime || 0), icon: '⏱️', color: '#13c2c2' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1 className="page-title">管理中心</h1>
        <p className="page-subtitle">平台数据总览</p>
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

      <div className="content-section">
        <div className="section-row">
          <Card title="最近注册用户" className="section-card">
            <div className="recent-list">
              {overview?.recentUsers?.map((user: any) => (
                <div key={user._id} className="recent-item">
                  <div className="item-icon">
                    {user.role === 'admin' ? '👨‍💼' : user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                  </div>
                  <div className="item-content">
                    <div className="item-title">{user.username}</div>
                    <div className="item-meta">
                      <span className="role-badge">{user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '老师' : '学生'}</span>
                      <span className="item-time">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </Card>

          <Card title="最近创建作品" className="section-card">
            <div className="recent-list">
              {overview?.recentProjects?.map((project: any) => (
                <div key={project._id} className="recent-item">
                  <div className="item-icon">🎨</div>
                  <div className="item-content">
                    <div className="item-title">{project.title}</div>
                    <div className="item-meta">
                      <span className="author">作者: {project.authorName}</span>
                      <span className="item-time">{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
