import React, { useRef, useEffect, useState } from 'react';
import './ScratchEditor.css';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

interface ScratchEditorProps {
  projectId?: string;
  onSave?: (projectData: any) => void;
  onLoad?: () => void;
  readOnly?: boolean;
}

const ScratchEditor: React.FC<ScratchEditorProps> = ({
  projectId,
  onSave,
  onLoad,
  readOnly = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const token = authService.getToken();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SCRATCH_LOADED') {
        setIsLoaded(true);
        onLoad?.();
      } else if (event.data.type === 'SCRATCH_PROJECT_SAVED') {
        onSave?.(event.data.projectData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSave, onLoad]);

  const handleSave = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SCRATCH_SAVE_PROJECT' },
        '*'
      );
    }
  };

  const handleLoadProject = () => {
    if (iframeRef.current?.contentWindow && projectId) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SCRATCH_LOAD_PROJECT', projectId },
        '*'
      );
    }
  };

  const getEditorUrl = () => {
    const baseUrl = 'http://localhost:5000/scratch3-master/index.html';
    const params = new URLSearchParams();
    if (projectId) {
      params.append('projectId', projectId);
    }
    if (token) {
      params.append('token', token);
    }
    return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="scratch-editor-container">
      <div className="scratch-editor-toolbar">
        <button
          className="scratch-editor-button"
          onClick={handleSave}
          disabled={!isLoaded || readOnly}
        >
          保存项目
        </button>
        {projectId && (
          <button
            className="scratch-editor-button"
            onClick={handleLoadProject}
            disabled={!isLoaded}
          >
            加载项目
          </button>
        )}
      </div>
      <div className="scratch-editor-wrapper">
        <iframe
          ref={iframeRef}
          src={getEditorUrl()}
          title="Scratch Editor"
          className="scratch-editor-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
      {!isLoaded && (
        <div className="scratch-editor-loading">
          <div className="loading-spinner"></div>
          <p>加载Scratch编辑器中...</p>
        </div>
      )}
    </div>
  );
};

export default ScratchEditor;
