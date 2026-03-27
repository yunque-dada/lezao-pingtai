import React from 'react';
import { Card, CardGrid, Button } from '../../components/common';
import './WorkCenter.css';

const WorkCenter: React.FC = () => {
  const works = [
    { id: 1, title: '我的第一个游戏', author: '小明', likes: 128, views: 456 },
    { id: 2, title: '海底世界动画', author: '小红', likes: 89, views: 234 },
    { id: 3, title: '音乐播放器', author: '小刚', likes: 67, views: 189 },
  ];

  return (
    <div className="work-center">
      <div className="page-header">
        <h1 className="page-title">作品展示</h1>
        <p className="page-subtitle">欣赏同学们的精彩作品</p>
      </div>

      <CardGrid>
        {works.map(work => (
          <Card key={work.id} hoverable className="work-card">
            <div className="work-preview">🎨</div>
            <div className="work-content">
              <h3 className="work-title">{work.title}</h3>
              <div className="work-author">作者：{work.author}</div>
              <div className="work-stats">
                <span>❤️ {work.likes}</span>
                <span>👁️ {work.views}</span>
              </div>
              <Button variant="primary" block>查看作品</Button>
            </div>
          </Card>
        ))}
      </CardGrid>
    </div>
  );
};

export default WorkCenter;
