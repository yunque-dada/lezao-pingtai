import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';
import { Course } from '../../types/course';
import { Button, Card } from '../../components/common';
import './CourseList.css';

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    search: ''
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { role: 'teacher' };
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      if (filter.search) params.search = filter.search;

      const response = await courseApi.getMyCourses(params);
      if (response.success) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个课程吗？')) return;

    try {
      const response = await courseApi.deleteCourse(id);
      if (response.success) {
        setCourses(courses.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await courseApi.publishCourse(id);
      if (response.success) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to publish course:', error);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published': return 'published';
      case 'draft': return 'draft';
      case 'archived': return 'archived';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="course-list-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载课程列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-list-page">
      <div className="page-header">
        <h1 className="page-title">课程管理</h1>
        <Button variant="primary" onClick={() => navigate('/teacher/courses/create')}>
          创建课程
        </Button>
      </div>

      <Card className="filter-card">
        <div className="filter-row">
          <input
            type="text"
            placeholder="搜索课程..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="search-input"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="filter-select"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="published">已发布</option>
            <option value="archived">已归档</option>
          </select>
        </div>
      </Card>

      {courses.length === 0 ? (
        <Card className="empty-card">
          <div className="empty-state">
            <p>暂无课程</p>
            <Button variant="primary" onClick={() => navigate('/teacher/courses/create')}>
              创建第一个课程
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="course-table">
            <div className="table-header">
              <div className="col-title">课程名称</div>
              <div className="col-category">分类</div>
              <div className="col-lessons">课时</div>
              <div className="col-students">学生</div>
              <div className="col-status">状态</div>
              <div className="col-actions">操作</div>
            </div>
            {courses.map(course => (
              <div key={course._id} className="table-row">
                <div className="col-title">
                  <span className="course-title">{course.title}</span>
                </div>
                <div className="col-category">{course.category || '-'}</div>
                <div className="col-lessons">{course.lessons?.length || 0}节</div>
                <div className="col-students">{course.enrolledCount || 0}人</div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusClass(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                </div>
                <div className="col-actions">
                  {course.status === 'draft' && (
                    <Button
                      variant="success"
                      size="small"
                      onClick={() => handlePublish(course._id)}
                    >
                      发布
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="small"
                    onClick={() => navigate(`/teacher/courses/stats/${course._id}`)}
                  >
                    统计
                  </Button>
                  <Button
                    variant="default"
                    size="small"
                    onClick={() => navigate(`/teacher/courses/edit/${course._id}`)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(course._id)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CourseList;
