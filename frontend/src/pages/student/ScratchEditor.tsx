import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import scratchApi from '../../services/scratchApi';
import './ScratchEditor.css';

const ScratchEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasOpenedEditorRef = useRef(false);
  const isMountedRef = useRef(true);

  const fetchProject = async () => {
    try {
      setLoading(true);
      await scratchApi.getProjectById(projectId!);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      if (isMountedRef.current) {
        navigate('/student/scratch-projects');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const createNewProject = () => {
    if (hasOpenedEditorRef.current) return;
    
    hasOpenedEditorRef.current = true;
    
    try {
      setLoading(true);
      // 获取用户token
      const token = localStorage.getItem('token');
      // 构建编辑器URL，注入自定义资源配置
      const editorUrl = new URL('http://localhost:5000/scratch3-master/index.html');
      editorUrl.searchParams.set('token', token || '');
      // 注入自定义角色库API配置
      editorUrl.searchParams.set('spriteApi', 'http://localhost:5000/api/scratch/resources/sprites/json');
      editorUrl.searchParams.set('backdropApi', 'http://localhost:5000/api/scratch/resources/backdrops/json');
      editorUrl.searchParams.set('soundApi', 'http://localhost:5000/api/scratch/resources/sounds/json');
      
      // 在新窗口中打开Scratch 3.0编辑器
      window.open(editorUrl.toString(), '_blank');
      // 重定向回作品列表
      setTimeout(() => {
        if (isMountedRef.current) {
          navigate('/student/scratch-projects');
        }
      }, 100);
    } catch (error) {
      console.error('Failed to create project:', error);
      if (isMountedRef.current) {
        navigate('/student/scratch-projects');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const openProjectEditor = () => {
    if (hasOpenedEditorRef.current) return;
    
    hasOpenedEditorRef.current = true;
    
    const token = localStorage.getItem('token');
    // 构建编辑器URL，注入自定义资源配置
    const editorUrl = new URL('http://localhost:5000/scratch3-master/index.html');
    editorUrl.searchParams.set('projectId', projectId || '');
    editorUrl.searchParams.set('token', token || '');
    // 注入自定义角色库API配置
    editorUrl.searchParams.set('spriteApi', 'http://localhost:5000/api/scratch/resources/sprites/json');
    editorUrl.searchParams.set('backdropApi', 'http://localhost:5000/api/scratch/resources/backdrops/json');
    editorUrl.searchParams.set('soundApi', 'http://localhost:5000/api/scratch/resources/sounds/json');
    
    window.open(editorUrl.toString(), '_blank');
    setTimeout(() => {
      if (isMountedRef.current) {
        navigate('/student/scratch-projects');
      }
    }, 100);
  };

  useEffect(() => {
    if (projectId === 'new') {
      createNewProject();
    } else if (projectId) {
      fetchProject();
    } else {
      navigate('/student/scratch-projects');
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (projectId && projectId !== 'new' && !loading && !hasOpenedEditorRef.current) {
      openProjectEditor();
    }
  }, [projectId, navigate, loading]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="scratch-editor-loading">
        <div className="loading-spinner"></div>
        <p>加载编辑器中...</p>
      </div>
    );
  }

  return (
    <div className="scratch-editor">
      <div className="scratch-editor-header">
        <h1>Scratch 3.0 编辑器</h1>
        <div className="scratch-editor-actions">
          <button 
            className="back-button" 
            onClick={() => navigate('/student/scratch-projects')}
          >
            返回作品列表
          </button>
        </div>
      </div>
      <div className="scratch-editor-content">
        <p>正在打开Scratch 3.0编辑器...</p>
        <p>如果编辑器没有自动打开，请点击 <a href="http://localhost:5000/scratch3-master/index.html" target="_blank" rel="noopener noreferrer">这里</a> 手动打开。</p>
      </div>
    </div>
  );
};

export default ScratchEditor;
