import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types/project';
import { projectApi } from '../../services/projectApi';
import { Button, Card } from '../../components/common';
import './WorkList.css';

const WorkList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    course: '',
    search: ''
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter.status) params.status = filter.status;
      if (filter.course) params.course = filter.course;
      if (filter.search) params.search = filter.search;

      const response = await projectApi.getProjects(params);
      if (response.success) {
        setProjects(response.data?.projects || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return '草稿';
      case 'submitted': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已驳回';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return 'draft';
      case 'submitted': return 'submitted';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="work-list-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载作品列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-list-page">
      <div className="page-header">
        <h1 className="page-title">作品管理</h1>
      </div>

      <Card className="filter-card">
        <div className="filter-row">
          <input
            type="text"
            placeholder="搜索作品..."
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
            <option value="submitted">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
      </Card>

      {projects.length === 0 ? (
        <Card className="empty-card">
          <div className="empty-state">
            <p>暂无作品</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="work-table">
            <div className="table-header">
              <div className="col-thumbnail">缩略图</div>
              <div className="col-title">作品名称</div>
              <div className="col-student">学生</div>
              <div className="col-course">课程</div>
              <div className="col-status">状态</div>
              <div className="col-score">评分</div>
              <div className="col-time">提交时间</div>
              <div className="col-actions">操作</div>
            </div>
            {projects.map(project => (
              <div key={project._id} className="table-row">
                <div className="col-thumbnail">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.title} />
                  ) : (
                    <div className="thumbnail-placeholder">🎨</div>
                  )}
                </div>
                <div className="col-title">
                  <div className="project-info">
                    <span className="project-title">{project.title}</span>
                    {project.isFeatured && <span className="featured-badge">推荐</span>}
                  </div>
                </div>
                <div className="col-student">
                  {project.author?.realName || project.author?.username}
                </div>
                <div className="col-course">
                  {project.course?.title || '-'}
                </div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusClass(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                <div className="col-score">
                  {project.score !== undefined ? `${project.score}分` : '-'}
                </div>
                <div className="col-time">
                  {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                </div>
                <div className="col-actions">
                  <Button
                    variant="default"
                    size="small"
                    onClick={() => navigate(`/teacher/works/${project._id}`)}
                  >
                    查看
                  </Button>
                  {project.status === 'submitted' && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => navigate(`/teacher/works/${project._id}/review`)}
                    >
                      审核
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WorkList;
