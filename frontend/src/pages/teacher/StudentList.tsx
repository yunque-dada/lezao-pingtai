import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { userApi } from '../../services/userApi';
import { Button, Card } from '../../components/common';
import './StudentList.css';

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    search: ''
  });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { role: 'student' };
      if (filter.status) params.status = filter.status;
      if (filter.search) params.search = filter.search;

      const response = await userApi.getUsers(params);
      if (response.success) {
        setUsers(response.data?.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
      <div className="student-list-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载学生列表...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-list-page">
      <div className="page-header">
        <h1 className="page-title">学生管理</h1>
      </div>

      <Card className="filter-card">
        <div className="filter-row">
          <input
            type="text"
            placeholder="搜索学生..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="search-input"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="filter-select"
          >
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="inactive">未激活</option>
            <option value="banned">已禁用</option>
          </select>
        </div>
      </Card>

      {users.length === 0 ? (
        <Card className="empty-card">
          <div className="empty-state">
            <p>暂无学生</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="student-table">
            <div className="table-header">
              <div className="col-name">姓名</div>
              <div className="col-username">用户名</div>
              <div className="col-email">邮箱</div>
              <div className="col-status">状态</div>
              <div className="col-created">创建时间</div>
              <div className="col-actions">操作</div>
            </div>
            {users.map(user => (
              <div key={user._id} className="table-row">
                <div className="col-name">
                  <div className="student-info">
                    <div className="student-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.realName || user.username} />
                      ) : (
                        <span className="avatar-placeholder">
                          {user.realName?.[0] || user.username?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <span className="student-name">{user.realName || user.username}</span>
                  </div>
                </div>
                <div className="col-username">{user.username}</div>
                <div className="col-email">{user.email}</div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusClass(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </div>
                <div className="col-created">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </div>
                <div className="col-actions">
                  <Button
                    variant="default"
                    size="small"
                    onClick={() => navigate(`/teacher/students/${user._id}`)}
                  >
                    查看
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentList;
