import React from 'react';
import { Course, DIFFICULTY_OPTIONS, STATUS_OPTIONS } from '../../types/course';
import './CourseDetail.css';

interface CourseDetailProps {
  course: Course;
  onClose?: () => void;
  onEdit?: (course: Course) => void;
  onPublish?: (course: Course) => void;
  onArchive?: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  isEnrolled?: boolean;
  showActions?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({
  course,
  onClose,
  onEdit,
  onPublish,
  onArchive,
  onEnroll,
  isEnrolled = false,
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <div className="course-detail">
      <div className="course-detail-header">
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="course-detail-cover">
        {course.coverImage ? (
          <img src={course.coverImage} alt={course.title} />
        ) : (
          <div className="cover-placeholder">
            <span>暂无封面</span>
          </div>
        )}
        <span
          className="course-status-badge"
          style={{ backgroundColor: status?.color }}
        >
          {status?.label}
        </span>
      </div>

      <div className="course-detail-content">
        <div className="course-detail-main">
          <h1 className="course-title">{course.title}</h1>

          <div className="course-meta-bar">
            <span
              className="difficulty-badge"
              style={{ color: difficulty?.color, borderColor: difficulty?.color }}
            >
              {difficulty?.label}
            </span>
            <span className="category-badge">{course.category}</span>
            <span className="duration-badge">{formatDuration(course.duration)}</span>
          </div>

          <div className="course-teacher">
            {course.teacher.avatar ? (
              <img
                src={course.teacher.avatar}
                alt={course.teacher.realName || course.teacher.username}
                className="teacher-avatar-large"
              />
            ) : (
              <div className="teacher-avatar-large-placeholder">
                {(course.teacher.realName || course.teacher.username).charAt(0)}
              </div>
            )}
            <div className="teacher-info">
              <span className="teacher-name-large">
                {course.teacher.realName || course.teacher.username}
              </span>
              {course.teacher.bio && (
                <span className="teacher-bio">{course.teacher.bio}</span>
              )}
            </div>
          </div>

          <div className="course-section">
            <h3>课程简介</h3>
            <p className="course-description">{course.description}</p>
          </div>

          {course.objectives.length > 0 && (
            <div className="course-section">
              <h3>学习目标</h3>
              <ul className="objectives-list">
                {course.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {course.prerequisites.length > 0 && (
            <div className="course-section">
              <h3>先修知识</h3>
              <ul className="prerequisites-list">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {course.tags.length > 0 && (
            <div className="course-section">
              <h3>标签</h3>
              <div className="tags-container">
                {course.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {course.lessons.length > 0 && (
            <div className="course-section">
              <h3>课程大纲</h3>
              <div className="lessons-list">
                {course.lessons.map((lesson, index) => (
                  <div key={lesson._id} className="lesson-item">
                    <span className="lesson-number">{index + 1}</span>
                    <div className="lesson-info">
                      <span className="lesson-title">{lesson.title}</span>
                      <span className="lesson-duration">
                        {formatDuration(lesson.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="course-detail-sidebar">
          <div className="stats-card">
            <h3>课程数据</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value-large">{course.lessons.length}</span>
                <span className="stat-label">课时</span>
              </div>
              <div className="stat-item">
                <span className="stat-value-large">{course.enrolledCount}</span>
                <span className="stat-label">报名</span>
              </div>
              <div className="stat-item">
                <span className="stat-value-large">{course.completedCount}</span>
                <span className="stat-label">完成</span>
              </div>
              <div className="stat-item">
                <span className="stat-value-large">
                  {course.rating > 0 ? course.rating.toFixed(1) : '-'}
                </span>
                <span className="stat-label">评分</span>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3>课程信息</h3>
            <div className="info-item">
              <span className="info-label">创建时间</span>
              <span className="info-value">{formatDate(course.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">更新时间</span>
              <span className="info-value">{formatDate(course.updatedAt)}</span>
            </div>
            {course.publishedAt && (
              <div className="info-item">
                <span className="info-label">发布时间</span>
                <span className="info-value">{formatDate(course.publishedAt)}</span>
              </div>
            )}
          </div>

          {showActions && (
            <div className="actions-card">
              {course.status === 'draft' && onPublish && (
                <button
                  className="action-btn primary"
                  onClick={() => onPublish(course)}
                >
                  发布课程
                </button>
              )}
              {course.status === 'published' && onArchive && (
                <button
                  className="action-btn secondary"
                  onClick={() => onArchive(course)}
                >
                  归档课程
                </button>
              )}
              {onEdit && (
                <button
                  className="action-btn secondary"
                  onClick={() => onEdit(course)}
                >
                  编辑课程
                </button>
              )}
              {onEnroll && !isEnrolled && course.status === 'published' && (
                <button
                  className="action-btn primary"
                  onClick={() => onEnroll(course)}
                >
                  立即报名
                </button>
              )}
              {isEnrolled && (
                <button className="action-btn disabled" disabled>
                  已报名
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
