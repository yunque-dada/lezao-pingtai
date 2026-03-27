import React from 'react';
import { Card, CardGrid, Button } from '../../components/common';
import './Dashboard.css';

const StudentDashboard: React.FC = () => {
  const stats = [
    { key: 'courses', label: '在学课程', value: '3', icon: '📚', color: '#667eea' },
    { key: 'completed', label: '已完成', value: '5', icon: '✅', color: '#52c41a' },
    { key: 'works', label: '我的作品', value: '12', icon: '🎨', color: '#faad14' },
    { key: 'points', label: '学习积分', value: '1,250', icon: '⭐', color: '#1890ff' },
  ];

  return (
    <div className="student-dashboard">
      <div className="page-header">
        <h1 className="page-title">学习中心</h1>
        <p className="page-subtitle">继续你的编程之旅</p>
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
        <CardGrid>
          <Card title="继续学习" extra={<a href="/student/my-courses">查看全部</a>}>
            <div className="course-list">
              <div className="course-item">
                <div className="course-cover">🎮</div>
                <div className="course-info">
                  <div className="course-title">Scratch入门：创建你的第一个动画</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                  </div>
                  <div className="course-meta">已完成 9/12 课</div>
                </div>
                <Button variant="primary" size="small">继续</Button>
              </div>
            </div>
          </Card>

          <Card title="最新作品" extra={<a href="/student/my-works">查看全部</a>}>
            <div className="work-list">
              <div className="work-item">
                <span className="work-icon">🎮</span>
                <div className="work-info">
                  <div className="work-title">我的第一个游戏</div>
                  <div className="work-meta">创建于 2天前</div>
                </div>
              </div>
            </div>
          </Card>
        </CardGrid>
      </div>
    </div>
  );
};

export default StudentDashboard;
