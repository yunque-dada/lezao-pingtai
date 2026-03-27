import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const classes = ['skeleton', `skeleton-${variant}`, className].filter(Boolean).join(' ');

  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  return <div className={classes} style={style} />;
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={['skeleton-text', className].filter(Boolean).join(' ')}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '' }) => {
  return (
    <div className={['skeleton-card', className].filter(Boolean).join(' ')}>
      <Skeleton variant="rect" height="180" />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="80%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
};

export default Skeleton;
