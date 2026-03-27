import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';
import { CourseStats } from '../../types/course';
import './CourseStats.css';

const CourseStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CourseStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        const response = await courseApi.getCourseStats(id);
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [id]);

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="loading-spinner"></div>
        <p>加载统计数据...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-error">
        <p>无法加载统计数据</p>
        <button onClick={() => navigate('/teacher/courses')}>返回课程列表</button>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1>课程统计</h1>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-value">{stats.enrolledCount}</span>
            <span className="stat-label">报名学生</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.completedCount}</span>
            <span className="stat-label">完成学生</span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">{stats.completionRate}%</span>
            <span className="stat-label">完成率</span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <span className="stat-value">{stats.lessonCount}</span>
            <span className="stat-label">课时数量</span>
          </div>
        </div>
      </div>

      <div className="stats-details">
        <div className="detail-section">
          <h2>课程评分</h2>
          <div className="rating-display">
            <div className="rating-score">
              <span className="score">{stats.rating.toFixed(1)}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= Math.round(stats.rating) ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="rating-count">{stats.ratingCount} 人评价</p>
          </div>
        </div>

        <div className="detail-section">
          <h2>课程时长</h2>
          <div className="duration-display">
            <span className="duration-value">{stats.totalDuration}</span>
            <span className="duration-unit">分钟</span>
          </div>
          <p className="duration-text">
            约 {Math.floor(stats.totalDuration / 60)} 小时 {stats.totalDuration % 60} 分钟
          </p>
        </div>
      </div>

      <div className="stats-chart">
        <h2>完成进度</h2>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        <div className="progress-legend">
          <div className="legend-item">
            <span className="legend-color completed"></span>
            <span>已完成: {stats.completedCount} 人</span>
          </div>
          <div className="legend-item">
            <span className="legend-color in-progress"></span>
            <span>学习中: {stats.enrolledCount - stats.completedCount} 人</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseStatsPage;
