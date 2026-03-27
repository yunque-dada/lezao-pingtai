import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User } from '../../types/user';
import { userApi } from '../../services/userApi';
import { Button, Card } from '../../components/common';
import './StudentDetail.css';

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchStudent(id);
    }
  }, [id]);

  const fetchStudent = async (studentId: string) => {
    try {
      const response = await userApi.getUserById(studentId);
      if (response.success) {
        setUser(response.data?.user || null);
      }
    } catch (error) {
      console.error('Failed to fetch student:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id || !newPassword) return;
    setResetting(true);
    try {
      const response = await userApi.resetPassword(id, newPassword);
      if (response.success) {
        alert('密码重置成功');
        setResetPasswordModal(false);
        setNewPassword('');
      }
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert('密码重置失败');
    } finally {
      setResetting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '正常';
      case 'inactive': return '未激活';
      case 'banned': return '已禁用';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'active';
      case 'inactive': return 'inactive';
      case 'banned': return 'banned';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="student-detail-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载学生信息...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="student-detail-page">
        <Card className="error-card">
          <div className="error-state">
            <p>学生不存在</p>
            <Button variant="default" onClick={() => navigate('/teacher/students')}>
              返回列表
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="student-detail-page">
      <div className="page-header">
        <div className="header-left">
          <Link to="/teacher/students" className="back-link">
            ← 返回列表
          </Link>
          <h1 className="page-title">学生详情</h1>
        </div>
        <div className="header-actions">
          <Button
            variant="secondary"
            onClick={() => setResetPasswordModal(true)}
          >
            重置密码
          </Button>
        </div>
      </div>

      <div className="detail-content">
        <Card className="info-card">
          <div className="card-header">
            <h2>基本信息</h2>
          </div>
          <div className="card-body">
            <div className="profile-section">
              <div className="profile-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.realName || user.username} />
                ) : (
                  <span className="avatar-placeholder">
                    {user.realName?.[0] || user.username?.[0] || '?'}
                  </span>
                )}
              </div>
              <div className="profile-info">
                <h3 className="profile-name">
                  {user.realName || user.username}
                </h3>
                <span className={`status-badge ${getStatusClass(user.status)}`}>
                  {getStatusText(user.status)}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>用户名</label>
                <span>{user.username}</span>
              </div>
              <div className="info-item">
                <label>邮箱</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>性别</label>
                <span>{user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '未填写'}</span>
              </div>
              <div className="info-item">
                <label>年级</label>
                <span>{'未填写'}</span>
              </div>
              <div className="info-item">
                <label>学校</label>
                <span>{'未填写'}</span>
              </div>
              <div className="info-item">
                <label>联系电话</label>
                <span>{user.phone || '未填写'}</span>
              </div>
              <div className="info-item full-width">
                <label>个人简介</label>
                <span>{user.bio || '暂无简介'}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stats-card">
          <div className="card-header">
            <h2>学习统计</h2>
          </div>
          <div className="card-body">
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">已完成课程</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">提交作品</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">获得点赞</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">学习时长(小时)</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="timeline-card">
          <div className="card-header">
            <h2>账户信息</h2>
          </div>
          <div className="card-body">
            <div className="timeline-list">
              <div className="timeline-item">
                <div className="timeline-label">创建时间</div>
                <div className="timeline-value">
                  {new Date(user.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-label">更新时间</div>
                <div className="timeline-value">
                  {new Date(user.updatedAt).toLocaleString('zh-CN')}
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-label">用户ID</div>
                <div className="timeline-value">{user._id}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {resetPasswordModal && (
        <div className="modal-overlay" onClick={() => setResetPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>重置密码</h3>
              <button
                className="close-button"
                onClick={() => setResetPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>新密码</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="default"
                onClick={() => setResetPasswordModal(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleResetPassword}
                disabled={resetting || !newPassword}
              >
                {resetting ? '重置中...' : '确认重置'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDetail;
