import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import scratchApi from '../../services/scratchApi';
import '../../components/ScratchProjectGrid.css';

interface FileProject {
  _id: string;
  title: string;
  filename: string;
  modifiedTime: string;
  size: number;
  author: string;
  authorName: string;
}

const ScratchProjectList: React.FC = () => {
  const [projects, setProjects] = useState<FileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      // 从文件系统获取项目列表
      const response = await scratchApi.getMyFileProjects();
      // 类型转换
      const fileProjects = (response.projects || []).map((project: any) => {
        return {
          _id: project._id || project.filename,
          title: project.title,
          filename: project.filename,
          modifiedTime: project.modifiedTime || project.createdAt || new Date().toISOString(),
          size: project.size || 0,
          author: project.author,
          authorName: project.authorName
        };
      });
      setProjects(fileProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    navigate('/student/scratch/editor/new');
  };

  const handleOpenProject = (filename: string) => {
    // 打开项目，使用文件名作为标识
    const token = localStorage.getItem('token');
    const editorUrl = new URL(`${window.location.origin}/scratch3-master/index.html`);
    editorUrl.searchParams.set('filename', filename);
    editorUrl.searchParams.set('token', token || '');
    // 注入自定义角色库API配置
    editorUrl.searchParams.set('spriteApi', `${window.location.origin}/api/scratch/resources/sprites/json`);
    editorUrl.searchParams.set('backdropApi', `${window.location.origin}/api/scratch/resources/backdrops/json`);
    editorUrl.searchParams.set('soundApi', `${window.location.origin}/api/scratch/resources/sounds/json`);
    
    window.open(editorUrl.toString(), '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // 过滤项目
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="scratch-project-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="scratch-project-container">
      <div className="scratch-project-header">
        <h1>Scratch作品中心</h1>
        <div className="scratch-project-controls">
          <div className="button-group">
            <button
              className="create-project-button"
              onClick={handleCreateProject}
            >
              新建作品
            </button>
            <button
              className="refresh-button"
              onClick={fetchProjects}
            >
              🔄 刷新
            </button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索作品..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="scratch-projects-grid">
        {filteredProjects.map((project) => (
          <div
            key={project._id}
            className="scratch-project-card"
            onClick={() => handleOpenProject(project.filename)}
          >
            <div className="project-thumbnail">
              <div className="thumbnail-placeholder">
                <span>🎨</span>
              </div>
            </div>
            <div className="project-info">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-author">作者: {project.authorName}</p>
              <p className="project-role"></p>
              <div className="project-stats">
                <span className="stat">📅 {formatDate(project.modifiedTime)}</span>
                <span className="stat">📦 {formatSize(project.size)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="scratch-project-empty">
          <p>暂无作品</p>
        </div>
      )}
    </div>
  );
};

export default ScratchProjectList;
