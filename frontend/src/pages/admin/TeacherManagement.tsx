import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Select, message } from '../../components/common';
import { userApi } from '../../services/userApi';
import { User, UserFormData } from '../../types/user';
import './TeacherManagement.css';

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'teacher',
    realName: '',
    phone: '',
    status: 'active'
  });

  // 获取老师列表
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({ role: 'teacher' });
      if (response.success) {
        setTeachers(response.data?.users || []);
      }
    } catch (error: any) {
      message.error('获取老师列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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

  // 打开添加老师模态框
  const handleAddTeacher = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'teacher',
      realName: '',
      phone: '',
      status: 'active'
    });
    setCurrentTeacher(null);
    setShowAddModal(true);
  };

  // 打开编辑老师模态框
  const handleEditTeacher = (teacher: User) => {
    setCurrentTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email,
      password: '',
      role: teacher.role,
      realName: teacher.realName || '',
      phone: teacher.phone || '',
      status: teacher.status
    });
    setShowEditModal(true);
  };

  // 保存老师
  const handleSaveTeacher = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      message.error('请填写所有必填字段');
      return;
    }

    try {
      if (currentTeacher) {
        // 更新老师
        await userApi.updateUser(currentTeacher._id, formData);
        message.success('老师信息更新成功');
        setShowEditModal(false);
      } else {
        // 创建老师
        await userApi.createUser(formData);
        message.success('老师添加成功');
        setShowAddModal(false);
      }
      fetchTeachers();
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  // 删除老师
  const handleDeleteTeacher = async (teacher: User) => {
    if (!window.confirm(`确定要删除老师 ${teacher.realName || teacher.username} 吗？`)) {
      return;
    }

    try {
      await userApi.deleteUser(teacher._id);
      message.success('老师删除成功');
      fetchTeachers();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="teacher-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-management">
      <div className="page-header">
        <h1 className="page-title">老师管理</h1>
        <Button variant="primary" onClick={handleAddTeacher}>
          添加老师
        </Button>
      </div>

      <Card>
        <div className="teacher-table">
          <div className="table-header">
            <div className="col-name">姓名</div>
            <div className="col-username">用户名</div>
            <div className="col-email">邮箱</div>
            <div className="col-status">状态</div>
            <div className="col-actions">操作</div>
          </div>
          {teachers.length === 0 ? (
            <div className="empty-state">
              <p>暂无老师数据</p>
            </div>
          ) : (
            teachers.map(teacher => (
              <div key={teacher._id} className="table-row">
                <div className="col-name">{teacher.realName || teacher.username}</div>
                <div className="col-username">{teacher.username}</div>
                <div className="col-email">{teacher.email}</div>
                <div className="col-status">
                  <span className={`status-badge ${teacher.status}`}>
                    {teacher.status === 'active' ? '正常' : 
                     teacher.status === 'inactive' ? '未激活' : '已禁用'}
                  </span>
                </div>
                <div className="col-actions">
                  <Button 
                    variant="default" 
                    size="small" 
                    onClick={() => handleEditTeacher(teacher)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => handleDeleteTeacher(teacher)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 添加老师模态框 */}
      <Modal
        title={currentTeacher ? '编辑老师' : '添加老师'}
        visible={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        onOk={handleSaveTeacher}
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
          <label>邮箱 *</label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="请输入邮箱"
          />
        </div>
        <div className="form-group">
          <label>密码 *</label>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={currentTeacher ? '留空表示不修改密码' : '请输入密码'}
          />
        </div>
        <div className="form-group">
          <label>姓名</label>
          <Input
            name="realName"
            value={formData.realName}
            onChange={handleInputChange}
            placeholder="请输入姓名"
          />
        </div>
        <div className="form-group">
          <label>电话</label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="请输入电话"
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

export default TeacherManagement;
