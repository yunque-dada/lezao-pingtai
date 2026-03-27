import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import learningApi, { CourseProgress, LessonWithProgress } from '../../services/learningApi';
import './CourseLearning.css';

const CourseLearning: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [courseData, setCourseData] = useState<CourseProgress | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourseProgress = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await learningApi.getCourseProgress(courseId);
      setCourseData(data);

      // 自动选择第一个未完成的课时
      const firstIncomplete = data.lessons.find(
        l => l.progress.status !== 'completed'
      ) || data.lessons[0];

      if (firstIncomplete) {
        setCurrentLesson(firstIncomplete);
      }
    } catch (err: any) {
      setError(err.message || '获取课程进度失败');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseProgress();
  }, [fetchCourseProgress]);

  // 记录视频播放进度
  const handleTimeUpdate = async () => {
    if (videoRef.current && currentLesson) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;

      if (duration > 0) {
        // 每10秒记录一次进度
        if (Math.floor(currentTime) % 10 === 0) {
          try {
            await learningApi.recordVideoProgress(
              currentLesson.lesson._id,
              currentTime,
              duration
            );
          } catch (err) {
            console.error('记录视频进度失败:', err);
          }
        }
      }
    }
  };

  // 标记课时完成
  const handleCompleteLesson = async () => {
    if (!currentLesson) return;

    try {
      await learningApi.completeLesson(currentLesson.lesson._id);

      // 更新本地状态
      setCurrentLesson({
        ...currentLesson,
        progress: {
          ...currentLesson.progress,
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString(),
        },
      });

      // 刷新课程数据
      fetchCourseProgress();
    } catch (err: any) {
      alert('标记完成失败: ' + err.message);
    }
  };

  // 切换课时
  const handleLessonChange = (lesson: LessonWithProgress) => {
    setCurrentLesson(lesson);

    // 更新最后访问时间
    learningApi.updateLessonProgress(lesson.lesson._id, {
      status: lesson.progress.status === 'not_started' ? 'in_progress' : lesson.progress.status,
    }).catch(console.error);
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '▶️';
      default:
        return '⭕';
    }
  };

  if (loading) {
    return (
      <div className="course-learning-loading">
        <div className="loading-spinner"></div>
        <p>加载课程中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-learning-error">
        <p>{error}</p>
        <button onClick={fetchCourseProgress}>重试</button>
      </div>
    );
  }

  if (!courseData || !currentLesson) {
    return (
      <div className="course-learning-error">
        <p>课程数据不存在</p>
      </div>
    );
  }

  return (
    <div className="course-learning">
      {/* 课程头部 */}
      <div className="course-header">
        <button className="back-button" onClick={() => navigate('/student/my-courses')}>
          ← 返回课程列表
        </button>
        <h1>{courseData.course.title}</h1>
        <div className="progress-info">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${courseData.overallProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            总进度: {courseData.overallProgress}% ({courseData.completedLessons}/{courseData.totalLessons} 课时)
          </span>
        </div>
      </div>

      <div className="course-content">
        {/* 左侧视频区域 */}
        <div className="video-section">
          <div className="video-container">
            {currentLesson.lesson.videoUrl ? (
              <video
                ref={videoRef}
                src={currentLesson.lesson.videoUrl}
                controls
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div className="no-video">
                <span className="icon">🎥</span>
                <p>暂无视频内容</p>
              </div>
            )}
          </div>

          <div className="lesson-info">
            <h2>{currentLesson.lesson.title}</h2>
            <p className="lesson-description">{currentLesson.lesson.description}</p>

            <div className="lesson-meta">
              <span className="duration">⏱️ {currentLesson.lesson.duration} 分钟</span>
              <span className="status">
                {getStatusIcon(currentLesson.progress.status)}
                {currentLesson.progress.status === 'completed' ? '已完成' :
                 currentLesson.progress.status === 'in_progress' ? '学习中' : '未开始'}
              </span>
            </div>

            {currentLesson.lesson.content && (
              <div className="lesson-content">
                <h3>课程内容</h3>
                <div dangerouslySetInnerHTML={{ __html: currentLesson.lesson.content }} />
              </div>
            )}

            {currentLesson.progress.status !== 'completed' && (
              <button
                className="complete-button"
                onClick={handleCompleteLesson}
              >
                标记为已完成
              </button>
            )}
          </div>
        </div>

        {/* 右侧课时列表 */}
        <div className="lesson-list">
          <h3>课时列表</h3>
          <div className="lessons">
            {courseData.lessons.map((lesson, index) => (
              <div
                key={lesson.lesson._id}
                className={`lesson-item ${
                  currentLesson.lesson._id === lesson.lesson._id ? 'active' : ''
                } ${lesson.progress.status}`}
                onClick={() => handleLessonChange(lesson)}
              >
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-details">
                  <span className="lesson-title">{lesson.lesson.title}</span>
                  <span className="lesson-duration">{lesson.lesson.duration}分钟</span>
                </div>
                <div className="lesson-status">
                  {getStatusIcon(lesson.progress.status)}
                </div>
                {lesson.progress.progress > 0 && lesson.progress.status !== 'completed' && (
                  <div className="lesson-progress-bar">
                    <div
                      className="lesson-progress-fill"
                      style={{ width: `${lesson.progress.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearning;
