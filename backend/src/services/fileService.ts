import fs from 'fs';
import path from 'path';

class FileService {
  private basePath: string;

  constructor() {
    this.basePath = path.join(__dirname, '../../uploads');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  private getUserDir(userId: string): string {
    const userDir = path.join(this.basePath, 'users', `user_${userId}`);
    const scratchDir = path.join(userDir, 'scratch');
    const thumbnailsDir = path.join(scratchDir, 'thumbnails');

    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir);
    }
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir);
    }

    return scratchDir;
  }

  /**
   * 生成唯一的文件名
   * @param title 作品标题
   * @param clientMark 客户端标记 (1=老师端, 2=学生端, 3=管理端)
   * @returns 文件名
   */
  private generateUniqueFilename(title: string, clientMark?: number): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    // 只替换空格为下划线，保留中文字符
    const sanitizedTitle = title.replace(/\s+/g, '_');
    
    // 如果提供了客户端标记，添加到文件名中
    if (clientMark) {
      return `${timestamp}_${random}_${sanitizedTitle}_${clientMark}.sb3`;
    }
    return `${timestamp}_${random}_${sanitizedTitle}.sb3`;
  }

  /**
   * 保存项目文件
   * @param userId 用户ID
   * @param file 文件内容
   * @param title 作品标题
   * @param clientMark 客户端标记 (1=老师端, 2=学生端, 3=管理端)
   * @returns 文件相对路径
   */
  async saveProjectFile(userId: string, file: Buffer, title: string, clientMark?: number): Promise<string> {
    const scratchDir = this.getUserDir(userId);
    const filename = this.generateUniqueFilename(title, clientMark);
    const filepath = path.join(scratchDir, filename);

    await fs.promises.writeFile(filepath, file);
    return path.relative(this.basePath, filepath);
  }

  async readProjectFile(filepath: string): Promise<Buffer> {
    const fullPath = path.join(this.basePath, filepath);
    return await fs.promises.readFile(fullPath);
  }

  async deleteProjectFile(filepath: string): Promise<void> {
    const fullPath = path.join(this.basePath, filepath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async getProjectFiles(userId: string): Promise<string[]> {
    const scratchDir = this.getUserDir(userId);
    const files = await fs.promises.readdir(scratchDir);
    return files.filter(file => file.endsWith('.sb3'));
  }

  /**
   * 获取项目文件列表及详情
   * @param userId 用户ID
   * @returns 文件详情列表，包含 filename, title, modifiedTime, size, clientMark
   */
  async getProjectFilesWithDetails(userId: string): Promise<Array<{ filename: string; title: string; modifiedTime: Date; size: number; clientMark?: number }>> {
    const scratchDir = this.getUserDir(userId);
    
    if (!fs.existsSync(scratchDir)) {
      return [];
    }

    const files = await fs.promises.readdir(scratchDir);
    const sb3Files = files.filter(file => file.endsWith('.sb3'));

    const fileDetails = await Promise.all(
      sb3Files.map(async (filename) => {
        const filepath = path.join(scratchDir, filename);
        const stats = await fs.promises.stat(filepath);
        
        // 从文件名中提取标题和客户端标记
        // 格式1：timestamp_random_title.sb3 (旧格式，无标记)
        // 格式2：timestamp_random_title_1.sb3 (新格式，有标记)
        let title = '';
        let clientMark: number | undefined = undefined;
        
        // 先去掉 .sb3 扩展名
        const nameWithoutExt = filename.replace('.sb3', '');
        // 按下划线分割
        const parts = nameWithoutExt.split('_');
        
        // 检查最后一部分是否是数字标记
        if (parts.length >= 4) {
          const lastPart = parts[parts.length - 1];
          const markNum = parseInt(lastPart, 10);
          if (!isNaN(markNum) && (markNum === 1 || markNum === 2 || markNum === 3)) {
            // 有标记
            clientMark = markNum;
            // 标题是第3部分到倒数第2部分的组合
            title = parts.slice(2, parts.length - 1).join(' ');
          } else {
            // 无标记
            title = parts.slice(2).join(' ');
          }
        } else if (parts.length >= 3) {
          // 无标记
          title = parts.slice(2).join(' ');
        } else {
          title = nameWithoutExt;
        }

        return {
          filename,
          title,
          modifiedTime: stats.mtime,
          size: stats.size,
          clientMark,
        };
      })
    );

    // 按修改时间倒序排列
    return fileDetails.sort((a, b) => b.modifiedTime.getTime() - a.modifiedTime.getTime());
  }
}

export default new FileService();
