import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Select, message } from '../../components/common';
import { courseApi } from '../../services/courseApi';
import { Course, CourseFormData } from '../../types/course';
import './CourseManagement.css';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    tags: [],
    duration: 0,
    prerequisites: [],
    objectives: []
  });

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getCourses();
      if (response.success) {
        setCourses(response.data.data || []);
      }
    } catch (error: any) {
      message.error('获取课程列表失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 处理表单变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 处理选择变化
  const handleSelectChange = (name: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  // 打开添加课程模态框
  const handleAddCourse = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      tags: [],
      duration: 0,
      prerequisites: [],
      objectives: []
    });
    setCurrentCourse(null);
    setShowAddModal(true);
  };

  // 打开编辑课程模态框
  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      category: course.category || '',
      difficulty: course.difficulty || 'beginner',
      tags: course.tags || [],
      duration: course.duration || 0,
      prerequisites: course.prerequisites || [],
      objectives: course.objectives || []
    });
    setShowEditModal(true);
  };

  // 保存课程
  const handleSaveCourse = async () => {
    if (!formData.title || !formData.description || !formData.category) {
      message.error('请填写所有必填字段');
      return;
    }

    try {
      if (currentCourse) {
        // 更新课程
        await courseApi.updateCourse(currentCourse._id, formData);
        message.success('课程信息更新成功');
        setShowEditModal(false);
      } else {
        // 创建课程
        await courseApi.createCourse(formData);
        message.success('课程添加成功');
        setShowAddModal(false);
      }
      fetchCourses();
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  // 删除课程
  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`确定要删除课程 ${course.title} 吗？`)) {
      return;
    }

    try {
      await courseApi.deleteCourse(course._id);
      message.success('课程删除成功');
      fetchCourses();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  // 发布课程
  const handlePublishCourse = async (course: Course) => {
    try {
      await courseApi.publishCourse(course._id);
      message.success('课程发布成功');
      fetchCourses();
    } catch (error: any) {
      message.error('发布失败: ' + error.message);
    }
  };

  // 归档课程
  const handleArchiveCourse = async (course: Course) => {
    try {
      await courseApi.archiveCourse(course._id);
      message.success('课程归档成功');
      fetchCourses();
    } catch (error: any) {
      message.error('归档失败: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="course-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-management">
      <div className="page-header">
        <h1 className="page-title">课程管理</h1>
        <Button variant="primary" onClick={handleAddCourse}>
          添加课程
        </Button>
      </div>

      <Card>
        <div className="course-table">
          <div className="table-header">
            <div className="col-title">课程名称</div>
            <div className="col-teacher">老师</div>
            <div className="col-lessons">课时</div>
            <div className="col-status">状态</div>
            <div className="col-actions">操作</div>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <p>暂无课程数据</p>
            </div>
          ) : (
            courses.map(course => (
              <div key={course._id} className="table-row">
                <div className="col-title">{course.title}</div>
                <div className="col-teacher">{course.teacher?.realName || course.teacher?.username || '未分配'}</div>
                <div className="col-lessons">{course.lessons?.length || 0}</div>
                <div className="col-status">
                  <span className={`status-badge ${course.status}`}>
                    {course.status === 'published' ? '已发布' : 
                     course.status === 'draft' ? '草稿' : '已归档'}
                  </span>
                </div>
                <div className="col-actions">
                  <Button 
                    variant="default" 
                    size="small" 
                    onClick={() => handleEditCourse(course)}
                  >
                    编辑
                  </Button>
                  {course.status === 'draft' && (
                    <Button 
                      variant="primary" 
                      size="small" 
                      onClick={() => handlePublishCourse(course)}
                    >
                      发布
                    </Button>
                  )}
                  {course.status === 'published' && (
                    <Button 
                      variant="warning" 
                      size="small" 
                      onClick={() => handleArchiveCourse(course)}
                    >
                      归档
                    </Button>
                  )}
                  <Button 
                    variant="danger" 
                    size="small" 
                    onClick={() => handleDeleteCourse(course)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* 添加课程模态框 */}
      <Modal
        title={currentCourse ? '编辑课程' : '添加课程'}
        visible={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
        }}
        onOk={handleSaveCourse}
      >
        <div className="form-group">
          <label>课程名称 *</label>
          <Input
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="请输入课程名称"
          />
        </div>
        <div className="form-group">
          <label>课程描述 *</label>
          <Input
            as="textarea"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="请输入课程描述"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>分类 *</label>
          <Input
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            placeholder="请输入课程分类"
          />
        </div>
        <div className="form-group">
          <label>难度级别</label>
          <Select
            value={formData.difficulty}
            onChange={(e) => handleSelectChange('difficulty', e)}
            options={[
              { value: 'beginner', label: '入门' },
              { value: 'intermediate', label: '中级' },
              { value: 'advanced', label: '高级' }
            ]}
          />
        </div>
        <div className="form-group">
          <label>课程时长（分钟）</label>
          <Input
            name="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange(e as any)}
            placeholder="请输入课程时长"
          />
        </div>
        <div className="form-group">
          <label>标签</label>
          <Input
            name="tags"
            value={formData.tags.join(', ')}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
            placeholder="请输入标签，用逗号分隔"
          />
        </div>
        <div className="form-group">
          <label> prerequisites</label>
          <Input
            as="textarea"
            name="prerequisites"
            value={formData.prerequisites.join(', ')}
            onChange={(e) => setFormData(prev => ({ ...prev, prerequisites: e.target.value.split(',').map(item => item.trim()) }))}
            placeholder="请输入先决条件，用逗号分隔"
            rows={2}
          />
        </div>
        <div className="form-group">
          <label>学习目标</label>
          <Input
            as="textarea"
            name="objectives"
            value={formData.objectives.join(', ')}
            onChange={(e) => setFormData(prev => ({ ...prev, objectives: e.target.value.split(',').map(item => item.trim()) }))}
            placeholder="请输入学习目标，用逗号分隔"
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagement;
