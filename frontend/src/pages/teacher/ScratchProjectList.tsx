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
  userId: string;
  isOwn?: boolean;
  clientMark?: number;
}

const ScratchProjectList: React.FC = () => {
  const [projects, setProjects] = useState<FileProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scratchApi.getAllFileProjects();
      
      const fileProjects = (response.projects || []).map((project: any) => {
        return {
          _id: project._id || project.filename,
          title: project.title,
          filename: project.filename,
          modifiedTime: project.modifiedTime || project.createdAt || new Date().toISOString(),
          size: project.size || 0,
          author: project.author,
          authorName: project.authorName,
          userId: project.userId,
          isOwn: project.isOwn,
          clientMark: project.clientMark,
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

  const handleOpenProject = (project: FileProject) => {
    const token = localStorage.getItem('token');
    const userId = project.userId || project.author;
    const editorUrl = new URL('http://localhost:5000/scratch3-master/index.html');
    editorUrl.searchParams.set('filename', project.filename);
    editorUrl.searchParams.set('userId', userId);
    editorUrl.searchParams.set('token', token || '');
    editorUrl.searchParams.set('spriteApi', 'http://localhost:5000/api/scratch/resources/sprites/json');
    editorUrl.searchParams.set('backdropApi', 'http://localhost:5000/api/scratch/resources/backdrops/json');
    editorUrl.searchParams.set('soundApi', 'http://localhost:5000/api/scratch/resources/sounds/json');
    
    window.open(editorUrl.toString(), '_blank');
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这个作品吗？')) {
      return;
    }
    try {
      await scratchApi.deleteProject(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      window.alert('删除作品失败，请稍后重试');
    }
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

  // 获取身份标签
  const getIdentityTag = (clientMark?: number) => {
    switch (clientMark) {
      case 1:
        return { class: 'teacher', text: '老师端', icon: '👨‍🏫' };
      case 2:
        return { class: 'student', text: '学生端', icon: '🎓' };
      case 3:
        return { class: 'admin', text: '管理端', icon: '👑' };
      default:
        return { class: 'unknown', text: '未知', icon: '❓' };
    }
  };

  // 过滤项目并分组
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(search.toLowerCase())
  );
  
  const ownProjects = filteredProjects.filter(project => {
    if (project.clientMark) {
      return project.clientMark === 1 || project.clientMark === 3;
    }
    return project.isOwn;
  });
  
  const studentProjects = filteredProjects.filter(project => {
    if (project.clientMark) {
      return project.clientMark === 2;
    }
    return !project.isOwn;
  });

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
        <h1>Scratch作品管理</h1>
        <div className="scratch-project-controls">
          <div className="button-group">
            <button className="create-project-button" onClick={handleCreateProject}>
              <span>+</span> 新建作品
            </button>
            <button className="refresh-button" onClick={fetchProjects}>
              <span>🔄</span> 刷新
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

      {/* 统计信息 */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{ownProjects.length}</span>
          <span>我的作品</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{studentProjects.length}</span>
          <span>学生作品</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{filteredProjects.length}</span>
          <span>总计</span>
        </div>
      </div>

      {/* 我的作品区域 */}
      {ownProjects.length > 0 && (
        <>
          <h2 className="section-title">
            👨‍🏫 我的作品
            <span className="count-badge">{ownProjects.length}</span>
          </h2>
          <div className="scratch-projects-grid">
            {ownProjects.map((project) => {
              const identity = getIdentityTag(project.clientMark);
              return (
                <div
                  key={project._id}
                  className="scratch-project-card own-project-card"
                  onClick={() => handleOpenProject(project)}
                >
                  <div className="project-thumbnail">
                    <span className={`source-badge ${identity.class}`}>
                      {identity.icon} {identity.text}
                    </span>
                    <div className="thumbnail-placeholder">👨‍🏫</div>
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{project.title}</h3>
                    <div className="project-meta">
                      <p className="project-author">作者: {project.authorName}</p>
                      <div className="identity-tags">
                        <span className={`identity-tag ${identity.class}`}>
                          {identity.icon} {identity.text}
                        </span>
                      </div>
                    </div>
                    <div className="project-stats">
                      <span className="stat">📅 {formatDate(project.modifiedTime)}</span>
                      <span className="stat">📦 {formatSize(project.size)}</span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      className="delete-button"
                      onClick={(e) => handleDeleteProject(project._id, e)}
                      title="删除作品"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 学生作品区域 */}
      {studentProjects.length > 0 && (
        <>
          <h2 className="section-title">
            🎨 学生作品
            <span className="count-badge">{studentProjects.length}</span>
          </h2>
          <div className="scratch-projects-grid">
            {studentProjects.map((project) => {
              const identity = getIdentityTag(project.clientMark);
              return (
                <div
                  key={project._id}
                  className="scratch-project-card"
                  onClick={() => handleOpenProject(project)}
                >
                  <div className="project-thumbnail">
                    <span className={`source-badge ${identity.class}`}>
                      {identity.icon} {identity.text}
                    </span>
                    <div className="thumbnail-placeholder">🎨</div>
                  </div>
                  <div className="project-info">
                    <h3 className="project-title">{project.title}</h3>
                    <div className="project-meta">
                      <p className="project-author">作者: {project.authorName}</p>
                      <div className="identity-tags">
                        <span className={`identity-tag ${identity.class}`}>
                          {identity.icon} {identity.text}
                        </span>
                      </div>
                    </div>
                    <div className="project-stats">
                      <span className="stat">📅 {formatDate(project.modifiedTime)}</span>
                      <span className="stat">📦 {formatSize(project.size)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {filteredProjects.length === 0 && (
        <div className="scratch-project-empty">
          <div className="scratch-project-empty-icon">📂</div>
          <h3>暂无作品</h3>
          <p>点击"新建作品"按钮创建您的第一个Scratch作品</p>
        </div>
      )}
    </div>
  );
};

export default ScratchProjectList;
