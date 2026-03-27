import React, { useState, useEffect, useCallback } from 'react';
import scratchResourceApi, { Sprite, Costume, Sound } from '../../services/scratchResourceApi';
import './ScratchSprites.css';

// 图片上传组件
interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, name: string, tags: string[]) => Promise<void>;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [tags, setTags] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 自动生成名称（去掉扩展名）
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setName(fileName);
      // 创建预览
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !name) return;
    setUploading(true);
    try {
      await onUpload(selectedFile, name, tags.split(',').map(t => t.trim()).filter(Boolean));
      resetForm();
      onClose();
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setName('');
    setTags('');
    setPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>从图片创建角色</h2>

        <div className="form-group">
          <label>选择图片 (PNG/SVG/JPG)</label>
          <input
            type="file"
            accept=".png,.svg,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        </div>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="预览" />
          </div>
        )}

        <div className="form-group">
          <label>角色名称</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="输入角色名称"
          />
        </div>

        <div className="form-group">
          <label>标签（用逗号分隔）</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="例如: animal, cute, pet"
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={uploading}>
            取消
          </button>
          <button 
            className="save-button" 
            onClick={handleSubmit}
            disabled={uploading || !selectedFile || !name}
          >
            {uploading ? '上传中...' : '创建角色'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 主要标签分类映射（中文 -> 英文标签）
const CATEGORY_MAP: Record<string, string[]> = {
  '动物': ['animal', 'animals', 'mammal', 'mammals', 'bird', 'birds', 'fish', 'reptile', 'insect', 'bug', 'butterfly', 'dinosaur'],
  '人物': ['people', 'person', 'character', 'boy', 'girl', 'man', 'woman', 'kid', 'dance', 'dancing'],
  '物品': ['thing', 'things', 'object', 'objects', 'item', 'items', 'tool', 'tools'],
  '舞蹈': ['dance', 'dancing'],
  '音乐': ['music', 'musical', 'instrument', 'instruments', 'sound', 'sounds'],
  '运动': ['sport', 'sports', 'ball', 'game', 'games'],
  '食物': ['food', 'foods', 'fruit', 'fruits', 'sweet', 'sweets'],
};

const MAIN_CATEGORIES = Object.keys(CATEGORY_MAP);

// 角色图标映射（使用emoji作为预览）
const SPRITE_ICONS: Record<string, string> = {
  'Abby': '👧',
  'Cat': '🐱',
  'Dog': '🐕',
  'Bear': '🐻',
  'Bird': '🐦',
  'Fish': '🐟',
  'Lion': '🦁',
  'Tiger': '🐯',
  'Rabbit': '🐰',
  'Mouse': '🐭',
  'Cow': '🐮',
  'Pig': '🐷',
  'Frog': '🐸',
  'Monkey': '🐵',
  'Chicken': '🐔',
  'Penguin': '🐧',
  'Turtle': '🐢',
  'Snake': '🐍',
  'Dragon': '🐲',
  'Horse': '🐴',
  'Sheep': '🐑',
  'Elephant': '🐘',
  'Giraffe': '🦒',
  'Dinosaur': '🦕',
  'Robot': '🤖',
  'Alien': '👽',
  'Ghost': '👻',
  'Wizard': '🧙',
  'Fairy': '🧚',
  'Mermaid': '🧜',
  'Vampire': '🧛',
  'Zombie': '🧟',
  'Superhero': '🦸',
  'Ninja': '🥷',
  'Pirate': '🏴‍☠️',
  'Police': '👮',
  'Doctor': '👨‍⚕️',
  'Chef': '👨‍🍳',
  'Teacher': '👨‍🏫',
  'Student': '👨‍🎓',
  'Artist': '👨‍🎨',
  'Musician': '👨‍🎤',
  'Farmer': '👨‍🌾',
  'Worker': '👨‍🔧',
  'Scientist': '👨‍🔬',
  'Astronaut': '👨‍🚀',
  'Firefighter': '👨‍🚒',
  'Judge': '👨‍⚖️',
  'Pilot': '👨‍✈️',
  'Baby': '👶',
  'Boy': '👦',
  'Girl': '👧',
  'Man': '👨',
  'Woman': '👩',
  'Grandma': '👵',
  'Grandpa': '👴',
};

// 使用本地静态资源
const getSpriteThumbnail = (sprite: Sprite): string | null => {
  if (sprite.costumes && sprite.costumes.length > 0) {
    const firstCostume = sprite.costumes[0];
    return `http://localhost:5000/scratch3-master/static/internalapi/asset/${firstCostume.md5ext}`;
  }
  return null;
};

// 使用本地颜色
const getLocalSpriteColor = (sprite: Sprite): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const colorIndex = sprite.name.length % colors.length;
  return colors[colorIndex];
};

// 获取角色的预览图标
const getSpriteIcon = (sprite: Sprite): string => {
  // 根据角色名称匹配图标
  for (const [name, icon] of Object.entries(SPRITE_ICONS)) {
    if (sprite.name.toLowerCase().includes(name.toLowerCase())) {
      return icon;
    }
  }
  // 根据标签匹配
  for (const tag of sprite.tags) {
    if (tag.includes('animal') || tag.includes('animals')) return '🐾';
    if (tag.includes('people') || tag.includes('person')) return '👤';
    if (tag.includes('food')) return '🍔';
    if (tag.includes('sport') || tag.includes('sports')) return '⚽';
    if (tag.includes('music')) return '🎵';
    if (tag.includes('dance')) return '💃';
  }
  // 默认图标
  return '🎭';
};

const ScratchSprites: React.FC = () => {
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [editingSprite, setEditingSprite] = useState<Sprite | null>(null);
  const [formData, setFormData] = useState<Partial<Sprite>>({
    name: '',
    tags: [],
    isStage: false,
    costumes: [],
    sounds: [],
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const fetchSprites = useCallback(async () => {
    try {
      setLoading(true);
      const tagsToFilter = selectedCategory ? CATEGORY_MAP[selectedCategory] : undefined;
      const response = await scratchResourceApi.getAllSprites({
        search: search || undefined,
        tags: tagsToFilter,
        page: currentPage,
        limit: itemsPerPage,
      });
      setSprites(response.sprites);
      setTotalCount(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (error) {
      console.error('Failed to fetch sprites:', error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, currentPage]);

  useEffect(() => {
    fetchSprites();
  }, [fetchSprites]);

  const handleCreate = () => {
    setEditingSprite(null);
    setFormData({
      name: '',
      tags: [],
      isStage: false,
      costumes: [],
      sounds: [],
    });
    setShowModal(true);
  };

  const handleImageUpload = async (file: File, name: string, tags: string[]) => {
    await scratchResourceApi.createSpriteFromImage(file, name, tags);
    fetchSprites();
  };

  const handleEdit = (sprite: Sprite) => {
    setEditingSprite(sprite);
    setFormData({ ...sprite });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个角色吗？')) return;
    try {
      await scratchResourceApi.deleteSprite(id);
      fetchSprites();
    } catch (error) {
      console.error('Failed to delete sprite:', error);
      window.alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSprite) {
        await scratchResourceApi.updateSprite(editingSprite._id, formData);
      } else {
        await scratchResourceApi.createSprite(formData);
      }
      setShowModal(false);
      fetchSprites();
    } catch (error) {
      console.error('Failed to save sprite:', error);
      window.alert('保存失败');
    }
  };

  const handleAddCostume = () => {
    const newCostume: Costume = {
      assetId: `costume_${Date.now()}`,
      name: '新造型',
      bitmapResolution: 1,
      md5ext: '',
      dataFormat: 'svg',
      rotationCenterX: 0,
      rotationCenterY: 0,
    };
    setFormData({
      ...formData,
      costumes: [...(formData.costumes || []), newCostume],
    });
  };

  const handleAddSound = () => {
    const newSound: Sound = {
      assetId: `sound_${Date.now()}`,
      name: '新声音',
      dataFormat: 'wav',
      rate: 44100,
      sampleCount: 0,
      md5ext: '',
    };
    setFormData({
      ...formData,
      sounds: [...(formData.sounds || []), newSound],
    });
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
        <h1>Scratch 角色库管理</h1>
        <div className="scratch-backdrops-controls">
          <button className="create-button" onClick={() => setShowImageUploadModal(true)}>
            📷 从图片创建
          </button>
          <button className="create-button" onClick={handleCreate}>
            ✏️ 手动创建
          </button>
          <div className="search-box">
            <input
              type="text"
              placeholder="搜索角色..."
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
        <span>共 {totalCount} 个角色</span>
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
        {sprites.map(sprite => {
          const thumbnailUrl = getSpriteThumbnail(sprite);
          const bgColor = getLocalSpriteColor(sprite);
          
          return (
            <div key={sprite._id} className="backdrop-card">
              <div className="backdrop-preview" style={{ background: `linear-gradient(135deg, ${bgColor} 0%, #fff 100%)` }}>
                {thumbnailUrl ? (
                  <img 
                    src={thumbnailUrl} 
                    alt={sprite.name}
                    className="backdrop-thumbnail"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="backdrop-icon">{getSpriteIcon(sprite)}</span>
                )}
              </div>
              <div className="backdrop-info">
                <h3 className="backdrop-name" title={sprite.name}>{sprite.name}</h3>
                <div className="backdrop-tags">
                  {sprite.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                  {sprite.tags.length > 3 && (
                    <span className="tag">+{sprite.tags.length - 3}</span>
                  )}
                </div>
              </div>
              <div className="backdrop-actions">
                <button className="edit-button" onClick={() => handleEdit(sprite)}>
                  编辑
                </button>
                <button className="delete-button" onClick={() => handleDelete(sprite._id)}>
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

      {/* 编辑/创建模态框 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingSprite ? '编辑角色' : '上传角色'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>基本信息</h3>
                <div className="form-group">
                  <label>角色名称</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={(formData.tags || []).join(', ')}
                    onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    placeholder="例如: animal, cute, pet"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isStage || false}
                      onChange={e => setFormData({ ...formData, isStage: e.target.checked })}
                    />
                    这是一个舞台
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>造型列表</h3>
                <button type="button" className="add-button" onClick={handleAddCostume}>
                  + 添加造型
                </button>
                {formData.costumes?.map((costume, idx) => (
                  <div key={idx} className="costume-item">
                    <input
                      type="text"
                      placeholder="造型名称"
                      value={costume.name}
                      onChange={e => {
                        const newCostumes = [...(formData.costumes || [])];
                        newCostumes[idx] = { ...costume, name: e.target.value };
                        setFormData({ ...formData, costumes: newCostumes });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="MD5.ext"
                      value={costume.md5ext}
                      onChange={e => {
                        const newCostumes = [...(formData.costumes || [])];
                        newCostumes[idx] = { ...costume, md5ext: e.target.value };
                        setFormData({ ...formData, costumes: newCostumes });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="form-section">
                <h3>声音列表</h3>
                <button type="button" className="add-button" onClick={handleAddSound}>
                  + 添加声音
                </button>
                {formData.sounds?.map((sound, idx) => (
                  <div key={idx} className="sound-item">
                    <input
                      type="text"
                      placeholder="声音名称"
                      value={sound.name}
                      onChange={e => {
                        const newSounds = [...(formData.sounds || [])];
                        newSounds[idx] = { ...sound, name: e.target.value };
                        setFormData({ ...formData, sounds: newSounds });
                      }}
                    />
                    <input
                      type="text"
                      placeholder="MD5.ext"
                      value={sound.md5ext}
                      onChange={e => {
                        const newSounds = [...(formData.sounds || [])];
                        newSounds[idx] = { ...sound, md5ext: e.target.value };
                        setFormData({ ...formData, sounds: newSounds });
                      }}
                    />
                  </div>
                ))}
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

      {/* 图片上传模态框 */}
      <ImageUploadModal
        isOpen={showImageUploadModal}
        onClose={() => setShowImageUploadModal(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
};

export default ScratchSprites;
