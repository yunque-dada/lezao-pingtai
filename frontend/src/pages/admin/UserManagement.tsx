import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Select, message } from '../../components/common';
import { userApi } from '../../services/userApi';
import { User, UserFormData } from '../../types/user';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'student',
    realName: '',
    phone: '',
    status: 'active'
  });

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers();
      if (response.success) {
        setUsers(response.data?.users || []);
      } else {
        message.error(response.message || '获取用户列表失败');
      }
    } catch (error: any) {
      message.error('获取用户列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 处理表单变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理选择变化
  const handleSelectChange = (name: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  // 打开添加用户模态框
  const handleAddUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'student',
      realName: '',
      phone: '',
      status: 'active'
    });
    setCurrentUser(null);
    setShowAddModal(true);
  };

  // 打开编辑用户模态框
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      realName: user.realName || '',
      phone: user.phone || '',
      status: user.status
    });
    setShowEditModal(true);
  };

  // 保存用户
  const handleSaveUser = async () => {
    if (!formData.username || !formData.password || !formData.role) {
      message.error('请填写所有必填字段');
      return;
    }

    try {
      if (currentUser) {
        // 更新用户
        const response = await userApi.updateUser(currentUser._id, formData);
        if (response.success) {
          message.success('用户信息更新成功');
          setShowEditModal(false);
          fetchUsers();
        } else {
          message.error(response.message || '更新失败');
        }
      } else {
        // 创建用户
        const response = await userApi.createUser(formData);
        if (response.success) {
          message.success('用户添加成功');
          setShowAddModal(false);
          fetchUsers();
        } else {
          message.error(response.message || '添加失败');
        }
      }
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  // 删除用户
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`确定要删除用户 ${user.realName || user.username} 吗？`)) {
      return;
    }

    try {
      const response = await userApi.deleteUser(user._id);
      if (response.success) {
        message.success('用户删除成功');
        fetchUsers();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 获取角色名称
  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return '管理员';
      case 'teacher': return '老师';
      case 'student': return '学生';
      default: return '未知';
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <Button variant="primary" onClick={handleAddUser}>
          添加用户
        </Button>
      </div>

      <Card>
        <div className="user-table">
          <div className="table-header">
            <div className="col-name">姓名</div>
            <div className="col-username">用户名</div>
            <div className="col-email">邮箱</div>
            <div className="col-role">角色</div>
            <div className="col-status">状态</div>
            <div className="col-actions">操作</div>
          </div>
          {users.length === 0 ? (
            <div className="empty-state">
              <p>暂无用户数据</p>
            </div>
          ) : (
            users.map(user => (
              <div key={user._id} className="table-row">
                <div className="col-name">{user.realName || user.username}</div>
                <div className="col-username">{user.username}</div>
                <div className="col-email">{user.email}</div>
                <div className="col-role">{getRoleName(user.role)}</div>
                <div className="col-status">
                  <span className={`status-badge ${user.status}`}>
                    {user.status === 'active' ? '正常' : 
                     user.status === 'inactive' ? '未激活' : '已禁用'}
                  </span>
                </div>
                <div className="col-actions">
                  <Button 
                    variant="default" 
                    size="small" 
                    onClick={() => handleEditUser(user)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => handleDeleteUser(user)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 添加用户模态框 */}
      <Modal
        title={currentUser ? '编辑用户' : '添加用户'}
        visible={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        onOk={handleSaveUser}
      >
        <div className="form-group">
          <label>用户名 *</label>
          <Input
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="请输入用户名"
          />
        </div>
        <div className="form-group">
          <label>密码 *</label>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={currentUser ? '留空表示不修改密码' : '请输入密码'}
          />
        </div>
        <div className="form-group">
          <label>角色 *</label>
          <Select
            value={formData.role}
            onChange={(e) => handleSelectChange('role', e)}
            options={[
              { value: 'student', label: '学生' },
              { value: 'teacher', label: '老师' },
              { value: 'admin', label: '管理员' }
            ]}
          />
        </div>
        <div className="form-group">
          <label>邮箱</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="请输入邮箱（选填）"
          />
        </div>
        <div className="form-group">
          <label>姓名</label>
          <Input
            name="realName"
            value={formData.realName}
            onChange={handleInputChange}
            placeholder="请输入姓名（选填）"
          />
        </div>
        <div className="form-group">
          <label>电话</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="请输入电话（选填）"
          />
        </div>
        <div className="form-group">
          <label>状态</label>
          <Select
            value={formData.status}
            onChange={(e) => handleSelectChange('status', e)}
            options={[
              { value: 'active', label: '正常' },
              { value: 'inactive', label: '未激活' },
              { value: 'banned', label: '已禁用' }
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
