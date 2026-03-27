import React from 'react';
import { Card, Button } from '../../components/common';
import './MyWorks.css';

const MyWorks: React.FC = () => {
  const works = [
    { id: 1, title: '我的第一个游戏', status: 'published', createdAt: '2026-01-15', views: 234 },
    { id: 2, title: '动画练习', status: 'draft', createdAt: '2026-01-10', views: 0 },
  ];

  return (
    <div className="my-works">
      <div className="page-header">
        <h1 className="page-title">我的作品</h1>
        <Button variant="primary">创建作品</Button>
      </div>

      <div className="works-grid">
        {works.map(work => (
          <Card key={work.id} className="work-item">
            <div className="work-preview-small">🎨</div>
            <div className="work-info">
              <h3 className="work-title">{work.title}</h3>
              <div className="work-meta">
                <span className={`status-badge ${work.status}`}>
                  {work.status === 'published' ? '已发布' : '草稿'}
                </span>
                <span>创建于 {work.createdAt}</span>
                <span>👁️ {work.views}</span>
              </div>
            </div>
            <div className="work-actions">
              <Button variant="default" size="small">编辑</Button>
              <Button variant="default" size="small">删除</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyWorks;
