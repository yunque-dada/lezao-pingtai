import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Select, message } from '../../components/common';
import { userApi } from '../../services/userApi';
import { User, UserFormData } from '../../types/user';
import './StudentManagement.css';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role: 'student',
    realName: '',
    phone: '',
    status: 'active'
  });

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await userApi.getUsers({ role: 'student' });
      if (response.success) {
        setStudents(response.data?.users || []);
      }
    } catch (error: any) {
      message.error('获取学生列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
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

  // 打开添加学生模态框
  const handleAddStudent = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'student',
      realName: '',
      phone: '',
      status: 'active'
    });
    setCurrentStudent(null);
    setShowAddModal(true);
  };

  // 打开编辑学生模态框
  const handleEditStudent = (student: User) => {
    setCurrentStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '',
      role: student.role,
      realName: student.realName || '',
      phone: student.phone || '',
      status: student.status
    });
    setShowEditModal(true);
  };

  // 保存学生
  const handleSaveStudent = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      message.error('请填写所有必填字段');
      return;
    }

    try {
      if (currentStudent) {
        // 更新学生
        await userApi.updateUser(currentStudent._id, formData);
        message.success('学生信息更新成功');
        setShowEditModal(false);
      } else {
        // 创建学生
        await userApi.createUser(formData);
        message.success('学生添加成功');
        setShowAddModal(false);
      }
      fetchStudents();
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  // 删除学生
  const handleDeleteStudent = async (student: User) => {
    if (!window.confirm(`确定要删除学生 ${student.realName || student.username} 吗？`)) {
      return;
    }

    try {
      await userApi.deleteUser(student._id);
      message.success('学生删除成功');
      fetchStudents();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="student-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-management">
      <div className="page-header">
        <h1 className="page-title">学生管理</h1>
        <Button variant="primary" onClick={handleAddStudent}>
          添加学生
        </Button>
      </div>

      <Card>
        <div className="student-table">
          <div className="table-header">
            <div className="col-name">姓名</div>
            <div className="col-username">用户名</div>
            <div className="col-email">邮箱</div>
            <div className="col-status">状态</div>
            <div className="col-actions">操作</div>
          </div>
          {students.length === 0 ? (
            <div className="empty-state">
              <p>暂无学生数据</p>
            </div>
          ) : (
            students.map(student => (
              <div key={student._id} className="table-row">
                <div className="col-name">{student.realName || student.username}</div>
                <div className="col-username">{student.username}</div>
                <div className="col-email">{student.email}</div>
                <div className="col-status">
                  <span className={`status-badge ${student.status}`}>
                    {student.status === 'active' ? '正常' : 
                     student.status === 'inactive' ? '未激活' : '已禁用'}
                  </span>
                </div>
                <div className="col-actions">
                  <Button 
                    variant="default" 
                    size="small" 
                    onClick={() => handleEditStudent(student)}
                  >
                    编辑
                  </Button>
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => handleDeleteStudent(student)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 添加学生模态框 */}
      <Modal
        title={currentStudent ? '编辑学生' : '添加学生'}
        visible={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        onOk={handleSaveStudent}
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
            placeholder={currentStudent ? '留空表示不修改密码' : '请输入密码'}
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

export default StudentManagement;
