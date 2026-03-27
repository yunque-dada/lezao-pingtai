import React from 'react';
import { Card, CardGrid, Button } from '../../components/common';
import './Dashboard.css';

const TeacherDashboard: React.FC = () => {
  const stats = [
    { key: 'courses', label: '我的课程', value: '12', icon: '📚', color: '#667eea' },
    { key: 'students', label: '学生人数', value: '156', icon: '👨‍🎓', color: '#52c41a' },
    { key: 'works', label: '学生作品', value: '328', icon: '🎨', color: '#faad14' },
    { key: 'views', label: '课程访问量', value: '2.5k', icon: '👁️', color: '#1890ff' },
  ];

  const quickActions = [
    { key: 'create-course', label: '创建课程', icon: '➕', path: '/teacher/courses/create' },
    { key: 'manage-courses', label: '管理课程', icon: '📋', path: '/teacher/courses' },
    { key: 'view-students', label: '查看学生', icon: '👥', path: '/teacher/students' },
    { key: 'review-works', label: '审阅作品', icon: '🔍', path: '/teacher/works' },
  ];

  return (
    <div className="teacher-dashboard">
      <div className="page-header">
        <h1 className="page-title">老师工作台</h1>
        <p className="page-subtitle">管理您的课程和学生</p>
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
            {quickActions.map(action => (
              <div key={action.key} className="action-item">
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="content-section">
        <CardGrid>
          <Card title="最近课程" extra={<a href="/teacher/courses">查看全部</a>}>
            <div className="course-list">
              <div className="course-item">
                <div className="course-cover">🎮</div>
                <div className="course-info">
                  <div className="course-title">Scratch入门：创建你的第一个动画</div>
                  <div className="course-meta">
                    <span>12节课</span>
                    <span>45名学生</span>
                  </div>
                </div>
              </div>
              <div className="course-item">
                <div className="course-cover">🎯</div>
                <div className="course-info">
                  <div className="course-title">Scratch进阶：制作小游戏</div>
                  <div className="course-meta">
                    <span>18节课</span>
                    <span>32名学生</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="待审阅作品" extra={<a href="/teacher/works">查看全部</a>}>
            <div className="work-list">
              <div className="work-item">
                <span className="work-icon">🎮</span>
                <div className="work-info">
                  <div className="work-title">我的第一个游戏</div>
                  <div className="work-meta">小明 · 2小时前提交</div>
                </div>
                <Button variant="primary" size="small">审阅</Button>
              </div>
              <div className="work-item">
                <span className="work-icon">🎨</span>
                <div className="work-info">
                  <div className="work-title">海底世界动画</div>
                  <div className="work-meta">小红 · 5小时前提交</div>
                </div>
                <Button variant="primary" size="small">审阅</Button>
              </div>
            </div>
          </Card>
        </CardGrid>
      </div>
    </div>
  );
};

export default TeacherDashboard;
