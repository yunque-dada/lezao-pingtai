import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../services/courseApi';
import { CourseFormData, DIFFICULTY_OPTIONS, CATEGORY_OPTIONS } from '../../types/course';
import './CourseForm.css';

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
}

const CourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [prereqInput, setPrereqInput] = useState('');
  const [objectiveInput, setObjectiveInput] = useState('');

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    tags: [],
    duration: 0,
    prerequisites: [],
    objectives: [],
    coverImage: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入课程标题';
    } else if (formData.title.length > 100) {
      newErrors.title = '标题不能超过100个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '请输入课程描述';
    } else if (formData.description.length > 2000) {
      newErrors.description = '描述不能超过2000个字符';
    }

    if (!formData.category) {
      newErrors.category = '请选择课程分类';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleAddPrereq = () => {
    const prereq = prereqInput.trim();
    if (prereq && !formData.prerequisites.includes(prereq)) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, prereq],
      }));
    }
    setPrereqInput('');
  };

  const handleRemovePrereq = (prereq: string) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter(p => p !== prereq),
    }));
  };

  const handleAddObjective = () => {
    const objective = objectiveInput.trim();
    if (objective && !formData.objectives.includes(objective)) {
      setFormData(prev => ({
        ...prev,
        objectives: [...prev.objectives, objective],
      }));
    }
    setObjectiveInput('');
  };

  const handleRemoveObjective = (objective: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter(o => o !== objective),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await courseApi.createCourse(formData);
      if (response.success) {
        navigate('/teacher/courses');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || '创建课程失败';
      setErrors({ title: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-form-container">
      <div className="course-form-header">
        <h1>创建课程</h1>
        <p>填写课程信息，创建新的课程</p>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h2>基本信息</h2>

          <div className="form-group">
            <label htmlFor="title">
              课程标题 <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="请输入课程标题"
              className={errors.title ? 'error' : ''}
              maxLength={100}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              课程描述 <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="请详细描述课程内容、特点等"
              className={errors.description ? 'error' : ''}
              rows={6}
              maxLength={2000}
            />
            <div className="char-count">
              {formData.description.length}/2000
            </div>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">
                课程分类 <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">请选择分类</option>
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="difficulty">难度等级</label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
              >
                {DIFFICULTY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">预计时长（分钟）</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min={0}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="coverImage">封面图片URL</label>
            <input
              type="text"
              id="coverImage"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="请输入封面图片URL"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>标签</h2>
          <div className="multi-input">
            <div className="input-with-btn">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="输入标签后按回车或点击添加"
              />
              <button type="button" onClick={handleAddTag} className="add-btn">
                添加
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map(tag => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>先修知识</h2>
          <div className="multi-input">
            <div className="input-with-btn">
              <input
                type="text"
                value={prereqInput}
                onChange={e => setPrereqInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddPrereq())}
                placeholder="输入学习本课程前需要掌握的知识"
              />
              <button type="button" onClick={handleAddPrereq} className="add-btn">
                添加
              </button>
            </div>
            <ul className="list-items">
              {formData.prerequisites.map((prereq, index) => (
                <li key={index}>
                  <span>{prereq}</span>
                  <button type="button" onClick={() => handleRemovePrereq(prereq)}>删除</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="form-section">
          <h2>学习目标</h2>
          <div className="multi-input">
            <div className="input-with-btn">
              <input
                type="text"
                value={objectiveInput}
                onChange={e => setObjectiveInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddObjective())}
                placeholder="输入学习本课程后能够达到的目标"
              />
              <button type="button" onClick={handleAddObjective} className="add-btn">
                添加
              </button>
            </div>
            <ul className="list-items">
              {formData.objectives.map((objective, index) => (
                <li key={index}>
                  <span>{objective}</span>
                  <button type="button" onClick={() => handleRemoveObjective(objective)}>删除</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/teacher/courses')}
            disabled={loading}
          >
            取消
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '创建中...' : '创建课程'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreate;
