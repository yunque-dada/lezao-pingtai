import React, { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  children?: ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  extra,
  footer,
  loading = false,
  hoverable = false,
  bordered = true,
  children,
  className = '',
  ...rest
}) => {
  const classes = [
    'custom-card',
    hoverable ? 'card-hoverable' : '',
    bordered ? 'card-bordered' : '',
    loading ? 'card-loading' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {(title || extra) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {extra && <div className="card-extra">{extra}</div>}
        </div>
      )}
      <div className="card-body">
        {loading ? (
          <div className="card-loading-content">
            <div className="loading-skeleton loading-title"></div>
            <div className="loading-skeleton loading-text"></div>
            <div className="loading-skeleton loading-text short"></div>
          </div>
        ) : (
          children
        )}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

interface CardGridProps {
  children?: ReactNode;
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({ children, className = '' }) => {
  return <div className={`card-grid ${className}`}>{children}</div>;
};

interface CardMetaProps {
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export const CardMeta: React.FC<CardMetaProps> = ({
  avatar,
  title,
  description,
  className = '',
}) => {
  return (
    <div className={`card-meta ${className}`}>
      {avatar && <div className="card-meta-avatar">{avatar}</div>}
      <div className="card-meta-content">
        {title && <div className="card-meta-title">{title}</div>}
        {description && <div className="card-meta-description">{description}</div>}
      </div>
    </div>
  );
};

export default Card;
