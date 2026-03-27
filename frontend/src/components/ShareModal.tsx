import React, { useState } from 'react';
import './ShareModal.css';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, projectId, projectTitle }) => {
  const [copied, setCopied] = useState(false);
  
  // 生成分享链接
  const shareUrl = `${window.location.origin}/scratch/projects/${projectId}`;
  
  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  
  // 分享到社交媒体
  const handleShareToSocial = (platform: string) => {
    const text = `来看看我的Scratch作品：${projectTitle}`;
    let url = '';
    
    switch (platform) {
      case 'wechat':
        // 微信分享需要调用微信SDK，这里仅作提示
        alert('请使用微信扫一扫功能分享');
        return;
      case 'weibo':
        url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(text)}`;
        break;
      case 'qq':
        url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(projectTitle)}&summary=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };
  
  // 生成二维码（使用外部API）
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  
  if (!isOpen) return null;
  
  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>分享作品</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="share-modal-content">
          {/* 作品信息 */}
          <div className="project-info">
            <div className="project-icon">🎨</div>
            <div className="project-details">
              <h4>{projectTitle}</h4>
              <p>分享你的创意作品</p>
            </div>
          </div>
          
          {/* 分享链接 */}
          <div className="share-link-section">
            <label>分享链接</label>
            <div className="link-input-group">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="share-link-input"
              />
              <button 
                className={`copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? '✓ 已复制' : '复制链接'}
              </button>
            </div>
          </div>
          
          {/* 二维码 */}
          <div className="qr-code-section">
            <label>扫描二维码分享</label>
            <div className="qr-code">
              <img src={qrCodeUrl} alt="分享二维码" />
            </div>
          </div>
          
          {/* 社交媒体分享 */}
          <div className="social-share-section">
            <label>分享到</label>
            <div className="social-buttons">
              <button 
                className="social-btn wechat"
                onClick={() => handleShareToSocial('wechat')}
                title="微信"
              >
                <span>💬</span>
                微信
              </button>
              <button 
                className="social-btn weibo"
                onClick={() => handleShareToSocial('weibo')}
                title="微博"
              >
                <span>📢</span>
                微博
              </button>
              <button 
                className="social-btn qq"
                onClick={() => handleShareToSocial('qq')}
                title="QQ"
              >
                <span>🐧</span>
                QQ
              </button>
            </div>
          </div>
          
          {/* 嵌入代码 */}
          <div className="embed-section">
            <label>嵌入代码</label>
            <textarea 
              readOnly 
              value={`<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`}
              className="embed-code"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
