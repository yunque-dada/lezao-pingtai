import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Pagination,
  Modal,
  Form,
  message,
  Empty,
  Spin,
  Tag,
  Space,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { scratchResourceApi } from '../../services/scratchResourceApi';
import './ScratchSounds.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface Sound {
  _id: string;
  name: string;
  tags: string[];
  assetId: string;
  md5ext: string;
  dataFormat: string;
  rate: number;
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分类映射（中文到英文标签）
const CATEGORY_MAP: Record<string, string[]> = {
  '动物': ['animal', 'animals'],
  '人声': ['human', 'voice', 'sing', 'vocal'],
  '乐器': ['instrument', 'instruments', 'music', 'musical'],
  '音效': ['effect', 'effects', 'sfx'],
  '环境': ['ambient', 'environment', 'nature'],
  '电子': ['electronic', 'synth', 'synthesizer'],
  '打击乐': ['percussion', 'drum', 'drums'],
};

const ScratchSounds: React.FC = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSound, setEditingSound] = useState<Sound | null>(null);
  const [form] = Form.useForm();

  const fetchSounds = useCallback(async () => {
    setLoading(true);
    try {
      const tags = selectedCategory !== 'all' ? [selectedCategory] : undefined;
      const response = await scratchResourceApi.getAllSounds({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        tags,
      });
      
      setSounds(response.sounds as Sound[]);
      setTotalCount(response.total);
    } catch (err: any) {
      console.error('获取音乐列表失败:', err);
      message.error('获取音乐列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchSounds();
  }, [fetchSounds]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setPage(1);
  };

  const handleOpenModal = (sound?: Sound) => {
    if (sound) {
      setEditingSound(sound);
      form.setFieldsValue({
        name: sound.name,
        tags: sound.tags.join(', '),
        assetId: sound.assetId,
        md5ext: sound.md5ext,
        dataFormat: sound.dataFormat,
        rate: sound.rate,
        sampleCount: sound.sampleCount,
      });
    } else {
      setEditingSound(null);
      form.resetFields();
      form.setFieldsValue({
        dataFormat: 'wav',
        rate: 44100,
        sampleCount: 0,
      });
    }
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingSound(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      const soundData = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
      };

      if (editingSound) {
        await scratchResourceApi.updateSound(editingSound._id, soundData);
        message.success('更新音乐成功');
      } else {
        await scratchResourceApi.createSound(soundData);
        message.success('创建音乐成功');
      }
      fetchSounds();
      handleCloseModal();
    } catch (err: any) {
      console.error('保存音乐失败:', err);
      message.error('保存音乐失败');
    }
  };

  const handleDelete = (sound: Sound) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除音乐 "${sound.name}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await scratchResourceApi.deleteSound(sound._id);
          message.success('删除音乐成功');
          fetchSounds();
        } catch (err: any) {
          console.error('删除音乐失败:', err);
          message.error('删除音乐失败');
        }
      },
    });
  };

  const getAudioUrl = (sound: Sound): string => {
    return `http://localhost:5000/scratch3-master/static/internalapi/asset/${sound.md5ext}`;
  };

  const formatDuration = (sampleCount: number, rate: number): string => {
    const seconds = sampleCount / rate;
    if (seconds < 60) {
      return `${seconds.toFixed(1)}秒`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  };

  return (
    <div className="scratch-sounds-page">
      <div className="page-header">
        <div className="header-content">
          <div>
            <Title level={2} className="page-title">音乐库管理</Title>
            <Text className="page-subtitle">管理Scratch编程平台的音乐资源</Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSounds}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              添加音乐
            </Button>
          </Space>
        </div>
      </div>

      <div className="filter-section">
        <Space size="middle" wrap>
          <Input.Search
            placeholder="搜索音乐名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            style={{ width: 150 }}
            placeholder="分类筛选"
          >
            <Option value="all">全部分类</Option>
            {Object.keys(CATEGORY_MAP).map(category => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </Space>
      </div>

      <div className="sounds-content">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>加载中...</Text>
          </div>
        ) : sounds.length === 0 ? (
          <Empty
            image={<CustomerServiceOutlined style={{ fontSize: 64, color: '#ccc' }} />}
            description={
              <>
                <Text strong style={{ fontSize: 16 }}>暂无音乐</Text>
                <br />
                <Text type="secondary">
                  {searchQuery || selectedCategory !== 'all' ? '尝试调整搜索条件' : '点击"添加音乐"按钮添加新音乐'}
                </Text>
              </>
            }
          />
        ) : (
          <>
            <Row gutter={[16, 16]} className="sounds-grid">
              {sounds.map((sound) => (
                <Col xs={24} sm={12} md={8} lg={6} key={sound._id}>
                  <Card
                    className="sound-card"
                    cover={
                      <div className="sound-icon-container">
                        <CustomerServiceOutlined className="sound-icon" />
                      </div>
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(sound)}
                      >
                        编辑
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(sound)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={<div className="sound-name" title={sound.name}>{sound.name}</div>}
                      description={
                        <div className="sound-info">
                          <div className="sound-details">
                            <Text type="secondary">格式: {sound.dataFormat}</Text>
                            <br />
                            <Text type="secondary">采样率: {(sound.rate / 1000).toFixed(1)}kHz</Text>
                            <br />
                            <Text type="secondary">时长: {formatDuration(sound.sampleCount, sound.rate)}</Text>
                          </div>
                          <div className="sound-tags">
                            {sound.tags.slice(0, 3).map((tag, index) => (
                              <Tag key={index} color="pink">{tag}</Tag>
                            ))}
                            {sound.tags.length > 3 && (
                              <Tag>+{sound.tags.length - 3}</Tag>
                            )}
                          </div>
                          <audio
                            controls
                            className="sound-audio"
                            src={getAudioUrl(sound)}
                            style={{ width: '100%', marginTop: 8 }}
                          >
                            您的浏览器不支持音频播放
                          </audio>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="pagination-container">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={totalCount}
                onChange={(p, s) => {
                  setPage(p);
                  if (s) setPageSize(s);
                }}
                pageSizeOptions={[12, 24, 48, 96]}
                showSizeChanger
                showTotal={(total, range) => `${range[0]}-${range[1]} / 共 ${total} 个`}
              />
            </div>
          </>
        )}
      </div>

      {/* 添加/编辑对话框 */}
      <Modal
        title={editingSound ? '编辑音乐' : '添加音乐'}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="音乐名称"
            rules={[{ required: true, message: '请输入音乐名称' }]}
          >
            <Input placeholder="请输入音乐名称" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签（用逗号分隔）"
          >
            <Input placeholder="例如: 动物, 人声, 乐器" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assetId"
                label="资源ID"
                rules={[{ required: true, message: '请输入资源ID' }]}
              >
                <Input placeholder="资源ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="md5ext"
                label="MD5扩展名"
                rules={[{ required: true, message: '请输入MD5扩展名' }]}
              >
                <Input placeholder="例如: abc123.wav" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dataFormat"
                label="音频格式"
              >
                <Select>
                  <Option value="wav">WAV</Option>
                  <Option value="mp3">MP3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="rate"
                label="采样率 (Hz)"
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sampleCount"
                label="采样数量"
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingSound ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScratchSounds;
