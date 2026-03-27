import React from 'react';
import { Card, Button } from '../../components/common';
import './WorkManagement.css';

const WorkManagement: React.FC = () => {
  const works = [
    { id: 1, title: '我的第一个游戏', student: '小明', course: 'Scratch入门', status: 'published', views: 234 },
    { id: 2, title: '海底世界', student: '小红', course: 'Scratch入门', status: 'pending', views: 0 },
  ];

  return (
    <div className="work-management">
      <div className="page-header">
        <h1 className="page-title">作品管理</h1>
      </div>

      <Card>
        <div className="work-table">
          <div className="table-header">
            <div className="col-title">作品名称</div>
            <div className="col-student">学生</div>
            <div className="col-course">课程</div>
            <div className="col-status">状态</div>
            <div className="col-views">浏览量</div>
            <div className="col-actions">操作</div>
          </div>
          {works.map(work => (
            <div key={work.id} className="table-row">
              <div className="col-title">{work.title}</div>
              <div className="col-student">{work.student}</div>
              <div className="col-course">{work.course}</div>
              <div className="col-status">
                <span className={`status-badge ${work.status}`}>
                  {work.status === 'published' ? '已发布' : '待审核'}
                </span>
              </div>
              <div className="col-views">{work.views}</div>
              <div className="col-actions">
                <Button variant="default" size="small">查看</Button>
                <Button variant="default" size="small">删除</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WorkManagement;
