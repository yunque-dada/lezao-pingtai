import React, { useEffect, useState } from 'react';
import './Message.css';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageProps {
  type: MessageType;
  content: string;
  duration?: number;
  onClose?: () => void;
}

const Message: React.FC<MessageProps> = ({ type, content, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) {
          onClose();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`message message-${type}`}>
      <div className="message-content">{content}</div>
      {onClose && (
        <button className="message-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

// 全局消息方法
interface MessageInstance {
  success: (content: string, duration?: number) => void;
  error: (content: string, duration?: number) => void;
  warning: (content: string, duration?: number) => void;
  info: (content: string, duration?: number) => void;
}

const message: MessageInstance = {
  success: (content, duration) => showMessage('success', content, duration),
  error: (content, duration) => showMessage('error', content, duration),
  warning: (content, duration) => showMessage('warning', content, duration),
  info: (content, duration) => showMessage('info', content, duration),
};

const showMessage = (type: MessageType, content: string, duration?: number) => {
  const messageElement = document.createElement('div');
  document.body.appendChild(messageElement);

  const ReactDOM = require('react-dom/client');
  const root = ReactDOM.createRoot(messageElement);

  root.render(
    <Message
      type={type}
      content={content}
      duration={duration}
      onClose={() => {
        root.unmount();
        document.body.removeChild(messageElement);
      }}
    />
  );
};

export default Message;
export { message };
