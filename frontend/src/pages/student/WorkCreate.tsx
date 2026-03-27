import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../../components/common';
import scratchApi from '../../services/scratchApi';
import './WorkCreate.css';

const WorkCreate: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [projectData, setProjectData] = useState<string>('');
  const [thumbnail, setThumbnail] = useState<string>('');

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const project = await scratchApi.getProjectById(projectId);
      setTitle(project.title);
      setDescription(project.description || '');
      setTags(project.tags.join(', '));
      setIsPublic(project.isPublic);
      setProjectData(project.projectData);
      setThumbnail(project.thumbnail || '');
    } catch (err: any) {
      setError('加载项目失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // 如果是编辑模式，加载现有项目
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

  // 保存项目（草稿）
  const handleSave = async () => {
    if (!title.trim()) {
      setError('请输入作品标题');
      return;
    }

    try {
      setSaving(true);

      // 获取Scratch编辑器中的项目数据（这里使用模拟数据）
      const projectContent = projectData || JSON.stringify({
        targets: [],
        monitors: [],
        extensions: [],
        meta: {
          semver: '3.0.0',
          vm: '0.2.0',
          agent: 'Mozilla/5.0'
        }
      });

      const data = {
        title: title.trim(),
        description: description.trim(),
        projectData: projectContent,
        thumbnail: thumbnail || undefined,
        isPublic: false, // 保存为草稿，不公开
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (projectId) {
        await scratchApi.updateProject(projectId, data);
      } else {
        await scratchApi.createProject(data);
      }

      alert('保存成功！');
      navigate('/student/my-works');
    } catch (err: any) {
      setError('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 发布作品
  const handlePublish = async () => {
    if (!title.trim()) {
      setError('请输入作品标题');
      return;
    }

    if (!window.confirm('确定要发布这个作品吗？发布后其他用户可以看到你的作品。')) {
      return;
    }

    try {
      setSaving(true);

      const projectContent = projectData || JSON.stringify({
        targets: [],
        monitors: [],
        extensions: [],
        meta: {
          semver: '3.0.0',
          vm: '0.2.0',
          agent: 'Mozilla/5.0'
        }
      });

      const data = {
        title: title.trim(),
        description: description.trim(),
        projectData: projectContent,
        thumbnail: thumbnail || undefined,
        isPublic: true, // 发布为公开
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (projectId) {
        await scratchApi.updateProject(projectId, data);
      } else {
        await scratchApi.createProject(data);
      }

      alert('发布成功！');
      navigate('/student/my-works');
    } catch (err: any) {
      setError('发布失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 生成缩略图（模拟）
  const generateThumbnail = () => {
    // 这里应该调用Scratch编辑器的截图功能
    // 暂时使用一个占位图
    setThumbnail('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRhOTBkOSIvPgogIDx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+U2NyYXRjaCDotKjph48udHRsPC90ZXh0Pgo8L3N2Zz4=');
  };

  if (loading) {
    return (
      <div className="work-create-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="work-create">
      <div className="work-create-header">
        <h1>{projectId ? '编辑作品' : '创建新作品'}</h1>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/student/my-works')}
            disabled={saving}
          >
            取消
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存草稿'}
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={saving}
          >
            {saving ? '发布中...' : '发布作品'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="work-create-content">
        {/* 左侧：Scratch编辑器区域 */}
        <div className="editor-section">
          <div className="scratch-editor-placeholder">
            <div className="editor-icon">🎨</div>
            <h3>Scratch 编辑器</h3>
            <p>在这里创作你的 Scratch 作品</p>
            <div className="editor-features">
              <span>🧩 拖拽积木</span>
              <span>🎭 添加角色</span>
              <span>🎵 添加声音</span>
            </div>
            <Button
              variant="primary"
              onClick={() => window.open('https://scratch.mit.edu/projects/editor/', '_blank')}
            >
              在 Scratch 中创作
            </Button>
            <p className="editor-hint">
              创作完成后，导出项目文件并在下方上传
            </p>
          </div>

          {/* 项目数据输入 */}
          <div className="project-data-section">
            <label>项目数据（JSON格式）</label>
            <Input
              as="textarea"
              value={projectData}
              onChange={(e) => setProjectData(e.target.value)}
              placeholder="粘贴 Scratch 项目 JSON 数据..."
              rows={6}
            />
          </div>
        </div>

        {/* 右侧：作品信息表单 */}
        <div className="form-section">
          <div className="form-card">
            <h2>作品信息</h2>

            <div className="form-group">
              <label>作品标题 *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给你的作品起个名字"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>作品描述</label>
              <Input
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="介绍一下你的作品..."
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label>标签</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="用逗号分隔，如：游戏,动画,故事"
              />
            </div>

            <div className="form-group">
              <label>作品缩略图</label>
              <div className="thumbnail-section">
                {thumbnail ? (
                  <div className="thumbnail-preview">
                    <img src={thumbnail} alt="缩略图" />
                    <button
                      className="remove-thumbnail"
                      onClick={() => setThumbnail('')}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    <span>🖼️</span>
                    <p>暂无缩略图</p>
                  </div>
                )}
                <Button
                  variant="secondary"
                  onClick={generateThumbnail}
                  size="small"
                >
                  生成缩略图
                </Button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <span>发布为公开作品</span>
              </label>
              <p className="hint">
                公开作品可以被其他用户看到和点赞
              </p>
            </div>
          </div>

          <div className="form-card tips-card">
            <h3>💡 创作提示</h3>
            <ul>
              <li>给你的作品起一个吸引人的标题</li>
              <li>详细描述作品的功能和玩法</li>
              <li>添加合适的标签，方便其他人找到</li>
              <li>定期保存草稿，避免数据丢失</li>
              <li>完成后可以分享到社交媒体</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkCreate;
