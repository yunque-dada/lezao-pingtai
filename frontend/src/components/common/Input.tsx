import React, { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from 'react';
import './Input.css';

type InputSize = 'small' | 'medium' | 'large';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  inputSize?: InputSize;
  inputPrefix?: ReactNode;
  inputSuffix?: ReactNode;
  fullWidth?: boolean;
}

interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  as?: 'input';
}

interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  as: 'textarea';
  rows?: number;
}

type CombinedInputProps = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, CombinedInputProps>(
  ({ as = 'input', label, error, hint, inputSize = 'medium', inputPrefix, inputSuffix, fullWidth = false, className = '', ...rest }, ref) => {
    const inputClasses = [
      'custom-input-wrapper',
      `input-${inputSize}`,
      error ? 'input-error' : '',
      fullWidth ? 'input-full-width' : '',
      inputPrefix ? 'has-prefix' : '',
      inputSuffix ? 'has-suffix' : '',
      className,
    ].filter(Boolean).join(' ');

    const inputId = rest.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={inputClasses}>
        {label && (
          <label className="input-label" htmlFor={inputId}>
            {label}
            {rest.required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-container">
          {inputPrefix && <span className="input-prefix">{inputPrefix}</span>}
          {as === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className="input-element textarea-element"
              {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className="input-element"
              {...(rest as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
          {inputSuffix && <span className="input-suffix">{inputSuffix}</span>}
        </div>
        {error && <span className="input-error-message">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends BaseInputProps, Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, inputSize = 'medium', fullWidth = false, options, className = '', ...rest }, ref) => {
    const selectClasses = [
      'custom-input-wrapper',
      `input-${inputSize}`,
      error ? 'input-error' : '',
      fullWidth ? 'input-full-width' : '',
      className,
    ].filter(Boolean).join(' ');

    const selectId = rest.id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={selectClasses}>
        {label && (
          <label className="input-label" htmlFor={selectId}>
            {label}
            {rest.required && <span className="input-required">*</span>}
          </label>
        )}
        <div className="input-container">
          <select
            ref={ref}
            id={selectId}
            className="input-element select-element"
            {...rest}
          >
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="select-arrow">▼</span>
        </div>
        {error && <span className="input-error-message">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Input;
