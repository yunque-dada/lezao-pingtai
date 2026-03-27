import React, { ReactNode, useEffect, useCallback } from 'react';
import './Modal.css';

type ModalSize = 'small' | 'medium' | 'large';

interface ModalProps {
  visible: boolean;
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closable?: boolean;
  maskClosable?: boolean;
  onClose: () => void;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  width?: number | string;
  centered?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  children,
  footer,
  size = 'medium',
  closable = true,
  maskClosable = true,
  onClose,
  onOk,
  onCancel,
  okText = '确定',
  cancelText = '取消',
  confirmLoading = false,
  width,
  centered = true,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    },
    [closable, onClose]
  );

  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  const handleMaskClick = () => {
    if (maskClosable) {
      onClose();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const modalStyle = width ? { width } : {};

  const modalClasses = [
    'custom-modal',
    `modal-${size}`,
    centered ? 'modal-centered' : '',
  ].filter(Boolean).join(' ');

  const defaultFooter = (
    <div className="modal-footer">
      <button className="modal-button modal-button-cancel" onClick={handleCancel}>
        {cancelText}
      </button>
      <button
        className="modal-button modal-button-ok"
        onClick={onOk}
        disabled={confirmLoading}
      >
        {confirmLoading && <span className="modal-button-spinner"></span>}
        {okText}
      </button>
    </div>
  );

  return (
    <div className="modal-root">
      <div className="modal-mask" onClick={handleMaskClick}></div>
      <div className="modal-wrap" onClick={handleMaskClick}>
        <div
          className={modalClasses}
          style={modalStyle}
          onClick={e => e.stopPropagation()}
        >
          {title && (
            <div className="modal-header">
              <div className="modal-title">{title}</div>
              {closable && (
                <button className="modal-close" onClick={onClose}>
                  ✕
                </button>
              )}
            </div>
          )}
          <div className="modal-body">{children}</div>
          {footer !== null && (footer || defaultFooter)}
        </div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  content?: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  content,
  type = 'confirm',
  onOk,
  onCancel,
  okText = '确定',
  cancelText = '取消',
}) => {
  const iconMap: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    confirm: '❓',
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      title={title}
      onClose={handleClose}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      size="small"
    >
      <div className="confirm-modal-content">
        <span className={`confirm-icon confirm-icon-${type}`}>
          {iconMap[type]}
        </span>
        <div className="confirm-text">{content}</div>
      </div>
    </Modal>
  );
};

export default Modal;
