import React from 'react';
import { Card, CardGrid, Button } from '../../components/common';
import './CourseCenter.css';

const CourseCenter: React.FC = () => {
  const courses = [
    { id: 1, title: 'Scratch入门', lessons: 12, students: 156, level: '初级' },
    { id: 2, title: 'Scratch进阶', lessons: 18, students: 89, level: '中级' },
    { id: 3, title: 'Scratch高级动画', lessons: 15, students: 45, level: '高级' },
  ];

  return (
    <div className="course-center">
      <div className="page-header">
        <h1 className="page-title">课程中心</h1>
        <p className="page-subtitle">探索精彩的编程课程</p>
      </div>

      <CardGrid>
        {courses.map(course => (
          <Card key={course.id} hoverable className="course-card">
            <div className="course-cover-large">📚</div>
            <div className="course-content">
              <h3 className="course-title">{course.title}</h3>
              <div className="course-stats">
                <span>{course.lessons}节课</span>
                <span>{course.students}人在学</span>
                <span className={`level-badge ${course.level}`}>{course.level}</span>
              </div>
              <Button variant="primary" block>开始学习</Button>
            </div>
          </Card>
        ))}
      </CardGrid>
    </div>
  );
};

export default CourseCenter;
