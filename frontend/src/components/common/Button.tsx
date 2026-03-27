import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'default';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  type?: 'submit' | 'reset' | 'button';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'medium',
  loading = false,
  disabled = false,
  block = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) => {
  const classes = [
    'custom-button',
    `button-${variant}`,
    `button-${size}`,
    block ? 'button-block' : '',
    loading ? 'button-loading' : '',
    disabled ? 'button-disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <span className="button-spinner"></span>}
      {!loading && icon && <span className="button-icon">{icon}</span>}
      {children && <span className="button-text">{children}</span>}
    </button>
  );
};

export default Button;
