import React, { useState, useEffect, useCallback } from 'react';
import scratchResourceApi, { Backdrop } from '../../services/scratchResourceApi';
import './ScratchBackdrops.css';

// 主要标签分类映射（中文 -> 英文标签）
const CATEGORY_MAP: Record<string, string[]> = {
  '室内': ['indoor', 'room', 'house', 'home'],
  '室外': ['outdoor', 'outside', 'nature', 'sky'],
  '自然': ['nature', 'natural', 'tree', 'forest', 'mountain', 'sea', 'ocean'],
  '城市': ['city', 'urban', 'town', 'street'],
  '太空': ['space', 'outerspace', 'planet', 'star'],
  '游戏': ['game', 'sports', 'sport'],
  '抽象': ['abstract', 'pattern', 'color'],
};

const MAIN_CATEGORIES = Object.keys(CATEGORY_MAP);

// 获取背景预览图URL
const getBackdropThumbnail = (backdrop: Backdrop): string | null => {
  if (backdrop.md5ext) {
    return `http://localhost:5000/scratch3-master/static/internalapi/asset/${backdrop.md5ext}`;
  }
  return null;
};

// 使用本地颜色
const getLocalBackdropColor = (backdrop: Backdrop): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const colorIndex = backdrop.name.length % colors.length;
  return colors[colorIndex];
};

const ScratchBackdrops: React.FC = () => {
  const [backdrops, setBackdrops] = useState<Backdrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingBackdrop, setEditingBackdrop] = useState<Backdrop | null>(null);
  const [formData, setFormData] = useState<Partial<Backdrop>>({
    name: '',
    tags: [],
    assetId: '',
    dataFormat: 'svg',
    md5ext: '',
    rotationCenterX: 240,
    rotationCenterY: 180,
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const fetchBackdrops = useCallback(async () => {
    try {
      setLoading(true);
      const tagsToFilter = selectedCategory ? CATEGORY_MAP[selectedCategory] : undefined;
      const response = await scratchResourceApi.getAllBackdrops({
        search: search || undefined,
        tags: tagsToFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setBackdrops(response.backdrops);
      setTotalCount(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (error) {
      console.error('Failed to fetch backdrops:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, currentPage]);

  useEffect(() => {
    fetchBackdrops();
  }, [fetchBackdrops]);

  const handleCreate = () => {
    setEditingBackdrop(null);
    setFormData({
      name: '',
      tags: [],
      assetId: '',
      dataFormat: 'svg',
      md5ext: '',
      rotationCenterX: 240,
      rotationCenterY: 180,
    });
    setShowModal(true);
  };

  const handleEdit = (backdrop: Backdrop) => {
    setEditingBackdrop(backdrop);
    setFormData({ ...backdrop });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个背景吗？')) return;
    try {
      await scratchResourceApi.deleteBackdrop(id);
      fetchBackdrops();
    } catch (error) {
      console.error('Failed to delete backdrop:', error);
      window.alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBackdrop) {
        await scratchResourceApi.updateBackdrop(editingBackdrop._id, formData);
      } else {
        await scratchResourceApi.createBackdrop(formData);
      }
      setShowModal(false);
      fetchBackdrops();
    } catch (error) {
      console.error('Failed to save backdrop:', error);
      window.alert('保存失败');
    }
  };

  const selectCategory = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(category);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="scratch-backdrops-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="scratch-backdrops">
      <div className="scratch-backdrops-header">
        <h1>Scratch 背景库管理</h1>
        <div className="scratch-backdrops-controls">
          <button className="create-button" onClick={handleCreate}>
            上传背景
          </button>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索背景..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="stats-bar">
        <span>共 {totalCount} 个背景</span>
        <span>第 {currentPage} / {totalPages} 页</span>
      </div>

      <div className="category-filter">
        <span className="filter-label">分类筛选：</span>
        {MAIN_CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => selectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="backdrops-grid">
        {backdrops.map(backdrop => {
          const thumbnailUrl = getBackdropThumbnail(backdrop);
          const bgColor = getLocalBackdropColor(backdrop);
          return (
            <div key={backdrop._id} className="backdrop-card">
              <div className="backdrop-preview" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, #fff 100%)` }}>
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={backdrop.name}
                    className="backdrop-thumbnail"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="backdrop-icon">🖼️</span>
                )}
              </div>
              <div className="backdrop-info">
                <h3 className="backdrop-name" title={backdrop.name}>{backdrop.name}</h3>
                <div className="backdrop-tags">
                  {backdrop.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                  {backdrop.tags.length > 3 && (
                    <span className="tag">+{backdrop.tags.length - 3}</span>
                  )}
                </div>
                <div className="backdrop-stats">
                  <span>📐 {backdrop.rotationCenterX} x {backdrop.rotationCenterY}</span>
                </div>
              </div>
              <div className="backdrop-actions">
                <button className="edit-button" onClick={() => handleEdit(backdrop)}>
                  编辑
                </button>
                <button className="delete-button" onClick={() => handleDelete(backdrop._id)}>
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-button" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 2 && page <= currentPage + 2)
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="page-ellipsis">...</span>
                )}
                <button
                  className={`page-button ${page === currentPage ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}
          
          <button 
            className="page-button" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </button>
        </div>
      )}

      {backdrops.length === 0 && (
        <div className="no-backdrops">
          <p>暂无背景</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingBackdrop ? '编辑背景' : '上传背景'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>背景名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={formData.tags?.join(', ')}
                  onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                />
              </div>

              <div className="form-group">
                <label>MD5.ext</label>
                <input
                  type="text"
                  value={formData.md5ext}
                  onChange={e => setFormData({ ...formData, md5ext: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>数据格式</label>
                <select
                  value={formData.dataFormat}
                  onChange={e => setFormData({ ...formData, dataFormat: e.target.value })}
                >
                  <option value="svg">SVG</option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>
                  取消
                </button>
                <button type="submit" className="save-button">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchBackdrops;
