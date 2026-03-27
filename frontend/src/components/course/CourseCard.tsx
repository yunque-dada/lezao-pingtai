import React from 'react';
import { Course, DIFFICULTY_OPTIONS, STATUS_OPTIONS } from '../../types/course';
import './CourseCard.css';

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onPublish?: (course: Course) => void;
  showActions?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onClick,
  onEdit,
  onDelete,
  onPublish,
  showActions = true,
}) => {
  const difficulty = DIFFICULTY_OPTIONS.find(d => d.value === course.difficulty);
  const status = STATUS_OPTIONS.find(s => s.value === course.status);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  const handleClick = () => {
    onClick?.(course);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(course);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(course);
  };

  const handlePublish = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPublish?.(course);
  };

  return (
    <div className="course-card" onClick={handleClick}>
      <div className="course-card-image">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} />
        ) : (
          <div className="course-card-placeholder">
            <span>暂无封面</span>
          </div>
        )}
        <span
          className="course-card-status"
          style={{ backgroundColor: status?.color }}
        >
          {status?.label}
        </span>
      </div>

      <div className="course-card-content">
        <div className="course-card-header">
          <h3 className="course-card-title">{course.title}</h3>
          <span
            className="course-card-difficulty"
            style={{ color: difficulty?.color, borderColor: difficulty?.color }}
          >
            {difficulty?.label}
          </span>
        </div>

        <p className="course-card-description">
          {course.description.length > 100
            ? `${course.description.substring(0, 100)}...`
            : course.description}
        </p>

        <div className="course-card-meta">
          <span className="course-card-category">{course.category}</span>
          <span className="course-card-duration">
            {formatDuration(course.duration)}
          </span>
        </div>

        <div className="course-card-stats">
          <div className="course-card-stat">
            <span className="stat-value">{course.lessons.length}</span>
            <span className="stat-label">课时</span>
          </div>
          <div className="course-card-stat">
            <span className="stat-value">{course.enrolledCount}</span>
            <span className="stat-label">报名</span>
          </div>
          <div className="course-card-stat">
            <span className="stat-value">
              {course.rating > 0 ? course.rating.toFixed(1) : '-'}
            </span>
            <span className="stat-label">评分</span>
          </div>
        </div>

        <div className="course-card-footer">
          <div className="course-card-teacher">
            {course.teacher.avatar ? (
              <img
                src={course.teacher.avatar}
                alt={course.teacher.realName || course.teacher.username}
                className="teacher-avatar"
              />
            ) : (
              <div className="teacher-avatar-placeholder">
                {(course.teacher.realName || course.teacher.username).charAt(0)}
              </div>
            )}
            <span className="teacher-name">
              {course.teacher.realName || course.teacher.username}
            </span>
          </div>

          {showActions && (
            <div className="course-card-actions">
              {course.status === 'draft' && onPublish && (
                <button
                  className="btn-publish"
                  onClick={handlePublish}
                  title="发布课程"
                >
                  发布
                </button>
              )}
              {onEdit && (
                <button
                  className="btn-edit"
                  onClick={handleEdit}
                  title="编辑"
                >
                  编辑
                </button>
              )}
              {onDelete && (
                <button
                  className="btn-delete"
                  onClick={handleDelete}
                  title="删除"
                >
                  删除
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
