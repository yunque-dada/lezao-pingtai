import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../components/common';
import './MyCourses.css';

const MyCourses: React.FC = () => {
  const navigate = useNavigate();
  const courses = [
    { id: 1, title: 'Scratch入门', progress: 75, totalLessons: 12, completedLessons: 9 },
    { id: 2, title: 'Scratch进阶', progress: 30, totalLessons: 18, completedLessons: 5 },
  ];

  const handleContinueLearning = (courseId: number) => {
    navigate(`/student/courses/${courseId}/learn`);
  };

  return (
    <div className="my-courses">
      <div className="page-header">
        <h1 className="page-title">我的课程</h1>
      </div>

      <div className="course-list">
        {courses.map(course => (
          <Card key={course.id} className="course-card">
            <div className="course-header">
              <div className="course-cover">📚</div>
              <div className="course-info">
                <h3 className="course-title">{course.title}</h3>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
                <div className="course-meta">
                  已完成 {course.completedLessons}/{course.totalLessons} 课 ({course.progress}%)
                </div>
              </div>
            </div>
            <div className="course-actions">
              <Button 
                variant="primary"
                onClick={() => handleContinueLearning(course.id)}
              >
                继续学习
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;
