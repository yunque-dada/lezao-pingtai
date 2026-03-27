import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project } from '../../types/project';
import { projectApi } from '../../services/projectApi';
import { Button, Card } from '../../components/common';
import './WorkDetail.css';

const WorkDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    try {
      const response = await projectApi.getProjectById(projectId);
      if (response.success) {
        setProject(response.data?.project || null);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!id) return;
    try {
      const response = await projectApi.toggleFeatured(id);
      if (response.success && response.data?.project) {
        setProject(response.data.project);
      }
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

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
      <div className="work-detail-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载作品详情...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="work-detail-page">
        <Card className="error-card">
          <div className="error-state">
            <p>作品不存在</p>
            <Button variant="default" onClick={() => navigate('/teacher/works')}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="work-detail-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/teacher/works" className="back-link">
            ← 返回列表
          </Link>
          <h1 className="page-title">作品详情</h1>
        </div>
        <div className="header-actions">
          {project.status === 'submitted' && (
            <Button
              variant="primary"
              onClick={() => navigate(`/teacher/works/${project._id}/review`)}
            >
              审核作品
            </Button>
          )}
          <Button
            variant={project.isFeatured ? 'secondary' : 'default'}
            onClick={handleToggleFeatured}
          >
            {project.isFeatured ? '取消推荐' : '设为推荐'}
          </Button>
        </div>
      </div>

      <div className="detail-content">
        <Card className="info-card">
          <div className="card-header">
            <h2>作品信息</h2>
          </div>
          <div className="card-body">
            <div className="project-header">
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <span>🎨</span>
                  </div>
                )}
              </div>
              <div className="project-meta">
                <div className="project-title-row">
                  <h2 className="project-title">{project.title}</h2>
                  {project.isFeatured && (
                    <span className="featured-badge">推荐作品</span>
                  )}
                </div>
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>作者</label>
                <span>{project.author?.realName || project.author?.username}</span>
              </div>
              <div className="info-item">
                <label>关联课程</label>
                <span>{project.course?.title || '-'}</span>
              </div>
              <div className="info-item">
                <label>浏览次数</label>
                <span>{project.views} 次</span>
              </div>
              <div className="info-item">
                <label>获得点赞</label>
                <span>{project.likes} 个</span>
              </div>
              {project.score !== undefined && (
                <div className="info-item">
                  <label>评分</label>
                  <span className="score-text">{project.score} 分</span>
                </div>
              )}
              <div className="info-item">
                <label>创建时间</label>
                <span>{new Date(project.createdAt).toLocaleString('zh-CN')}</span>
              </div>
              <div className="info-item full-width">
                <label>作品描述</label>
                <span>{project.description || '暂无描述'}</span>
              </div>
              {project.tags?.length > 0 && (
                <div className="info-item full-width">
                  <label>标签</label>
                  <div className="tags-list">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="tag-item">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {project.comment && (
          <Card className="review-card">
            <div className="card-header">
              <h2>审核评语</h2>
            </div>
            <div className="card-body">
              <div className="review-info">
                <div className="review-meta">
                  <span className="reviewer">
                    审核人：{project.reviewedBy?.realName || project.reviewedBy?.username}
                  </span>
                  <span className="review-time">
                    {project.reviewedAt && new Date(project.reviewedAt).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="review-comment">
                  {project.comment}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card className="preview-card">
          <div className="card-header">
            <h2>作品预览</h2>
          </div>
          <div className="card-body">
            <div className="preview-placeholder">
              <div className="preview-icon">🎬</div>
              <p>Scratch作品预览区域</p>
              <p className="preview-hint">（需要集成Scratch播放器）</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkDetail;
