import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/common';
import './SystemSettings.css';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: '少儿编程课程平台',
    siteDescription: '让编程学习变得简单有趣',
    contactEmail: 'admin@example.com',
    maxStudentsPerCourse: 50,
    allowRegistration: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('保存设置:', settings);
  };

  return (
    <div className="system-settings">
      <div className="page-header">
        <h1 className="page-title">系统设置</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="settings-form">
          <Input
            label="网站名称"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            fullWidth
          />
          <Input
            as="textarea"
            label="网站描述"
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            fullWidth
            rows={3}
          />
          <Input
            label="联系邮箱"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            fullWidth
          />
          <Input
            label="每课程最大学生数"
            type="number"
            value={settings.maxStudentsPerCourse}
            onChange={(e) => setSettings({ ...settings, maxStudentsPerCourse: parseInt(e.target.value) })}
            fullWidth
          />
          <div className="form-actions">
            <Button variant="primary" type="submit">保存设置</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SystemSettings;
