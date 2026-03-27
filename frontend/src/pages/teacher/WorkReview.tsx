import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Project } from '../../types/project';
import { ReviewData } from '../../types/project';
import { projectApi } from '../../services/projectApi';
import { Button, Card } from '../../components/common';
import './WorkReview.css';

const WorkReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({
    status: 'approved',
    score: undefined,
    comment: '',
    isFeatured: false
  });

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

  const handleSubmitReview = async () => {
    if (!id) return;
    
    if (reviewData.status === 'approved' && reviewData.score === undefined) {
      alert('请输入评分');
      return;
    }

    if (!reviewData.comment?.trim()) {
      alert('请输入评语');
      return;
    }

    setSubmitting(true);
    try {
      const response = await projectApi.reviewProject(id, reviewData);
      if (response.success) {
        alert('审核成功');
        navigate(`/teacher/works/${id}`);
      }
    } catch (error) {
      console.error('Failed to review project:', error);
      alert('审核失败');
    } finally {
      setSubmitting(false);
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
      <div className="work-review-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载作品详情...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="work-review-page">
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

  if (project.status !== 'submitted') {
    return (
      <div className="work-review-page">
        <Card className="error-card">
          <div className="error-state">
            <p>该作品不是待审核状态，无法进行审核</p>
            <Button variant="default" onClick={() => navigate(`/teacher/works/${id}`)}>
              返回作品详情
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="work-review-page">
      <div className="page-header">
        <div className="header-left">
          <Link to={`/teacher/works/${id}`} className="back-link">
            ← 返回详情
          </Link>
          <h1 className="page-title">审核作品</h1>
        </div>
      </div>

      <div className="review-content">
        <div className="left-column">
          <Card className="info-card">
            <div className="card-header">
              <h2>作品信息</h2>
            </div>
            <div className="card-body">
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.title} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <span>🎨</span>
                  </div>
                )}
              </div>
              <h3 className="project-title">{project.title}</h3>
              <span className={`status-badge ${getStatusClass(project.status)}`}>
                {getStatusText(project.status)}
              </span>

              <div className="info-list">
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
                <div className="info-item">
                  <label>提交时间</label>
                  <span>{new Date(project.createdAt).toLocaleString('zh-CN')}</span>
                </div>
                {project.description && (
                  <div className="info-item full-width">
                    <label>作品描述</label>
                    <span>{project.description}</span>
                  </div>
                )}
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

        <div className="right-column">
          <Card className="review-card">
            <div className="card-header">
              <h2>审核结果</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>审核状态 *</label>
                <div className="status-options">
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={reviewData.status === 'approved'}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as 'approved' | 'rejected' })}
                    />
                    <span className="status-label approved">通过</span>
                  </label>
                  <label className="status-option">
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={reviewData.status === 'rejected'}
                      onChange={(e) => setReviewData({ ...reviewData, status: e.target.value as 'approved' | 'rejected' })}
                    />
                    <span className="status-label rejected">驳回</span>
                  </label>
                </div>
              </div>

              {reviewData.status === 'approved' && (
                <div className="form-group">
                  <label>评分 (0-100) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={reviewData.score !== undefined ? reviewData.score : ''}
                    onChange={(e) => setReviewData({ 
                      ...reviewData, 
                      score: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    placeholder="请输入评分"
                  />
                </div>
              )}

              <div className="form-group">
                <label>评语 *</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="请输入评语..."
                  rows={6}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={reviewData.isFeatured}
                    onChange={(e) => setReviewData({ ...reviewData, isFeatured: e.target.checked })}
                  />
                  <span>设为推荐作品</span>
                </label>
              </div>

              <div className="form-actions">
                <Button
                  variant="default"
                  onClick={() => navigate(`/teacher/works/${id}`)}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                >
                  {submitting ? '提交中...' : '提交审核'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkReview;
