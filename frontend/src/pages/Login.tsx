import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码长度至少为6位';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('开始登录，用户名:', formData.username);
      await login(formData.username, formData.password);
      console.log('登录成功');
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error.response?.data?.message || '登录失败，请稍后再试';
      console.log('错误信息:', errorMessage);

      // 根据错误类型显示不同的错误信息
      if (errorMessage.includes('用户名不存在')) {
        setErrors({ username: '用户名不存在' });
      } else if (errorMessage.includes('密码错误')) {
        setErrors({ password: '密码错误' });
      } else if (errorMessage.includes('账户已被禁用')) {
        setErrors({ username: '账户已被禁用，请联系管理员' });
      } else if (error.response?.status >= 500) {
        // 服务器错误
        setErrors({ password: '网页维护中，请稍后再试' });
      } else {
        // 其他错误（网络问题等）
        setErrors({ password: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>少儿编程课程平台</h1>
          <p>欢迎回来，请登录您的账号</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名"
                disabled={loading}
                className={errors.username ? 'error' : ''}
              />
            </div>
            {errors.username && <span className="error-message">{errors.username}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="请输入密码"
                disabled={loading}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                登录中...
              </>
            ) : (
              '登 录'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <div className="demo-accounts">
            <p>测试账号（密码均为 123456）：</p>
            <div className="account-list">
              <span className="account-item">管理员: admin</span>
              <span className="account-item">老师: teacher1, teacher2</span>
              <span className="account-item">学生: student1, student2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
