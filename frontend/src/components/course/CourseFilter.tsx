import React, { useState } from 'react';
import { CourseFilter as FilterType, DIFFICULTY_OPTIONS, STATUS_OPTIONS, CATEGORY_OPTIONS } from '../../types/course';
import './CourseFilter.css';

interface CourseFilterProps {
  onFilterChange: (filter: FilterType) => void;
  initialFilter?: FilterType;
  showStatusFilter?: boolean;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
  onFilterChange,
  initialFilter = {},
  showStatusFilter = true,
}) => {
  const [filter, setFilter] = useState<FilterType>(initialFilter);
  const [searchInput, setSearchInput] = useState(initialFilter.search || '');

  const handleChange = (key: keyof FilterType, value: string | undefined) => {
    const newFilter = { ...filter, [key]: value };
    if (!value) {
      delete newFilter[key];
    }
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleChange('search', searchInput || undefined);
  };

  const handleClear = () => {
    setFilter({});
    setSearchInput('');
    onFilterChange({});
  };

  return (
    <div className="course-filter">
      <form className="filter-search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="搜索课程标题、描述或标签..."
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-btn">
          搜索
        </button>
      </form>

      <div className="filter-options">
        <div className="filter-group">
          <label>分类</label>
          <select
            value={filter.category || ''}
            onChange={(e) => handleChange('category', e.target.value || undefined)}
          >
            <option value="">全部分类</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>难度</label>
          <select
            value={filter.difficulty || ''}
            onChange={(e) => handleChange('difficulty', e.target.value || undefined)}
          >
            <option value="">全部难度</option>
            {DIFFICULTY_OPTIONS.map((diff) => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

        {showStatusFilter && (
          <div className="filter-group">
            <label>状态</label>
            <select
              value={filter.status || ''}
              onChange={(e) => handleChange('status', e.target.value || undefined)}
            >
              <option value="">全部状态</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button className="filter-clear" onClick={handleClear}>
          清除筛选
        </button>
      </div>
    </div>
  );
};

export default CourseFilter;
