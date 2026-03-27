import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound: React.FC = () => {
  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="not-found-code">404</div>
        <h1>页面不存在</h1>
        <p className="not-found-message">
          抱歉，您访问的页面不存在或已被删除
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">
            返回首页
          </Link>
          <button 
            className="not-found-btn secondary"
            onClick={() => window.history.back()}
          >
            返回上一页
          </button>
        </div>
        <div className="not-found-help">
          <p>如果您认为这是个错误，请联系管理员</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
