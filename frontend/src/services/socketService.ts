import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private token: string = '';

  // 初始化连接
  connect(token: string) {
    this.token = token;
    
    // 使用当前域名连接Socket.io
    this.socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 加入课程房间
  joinCourse(courseId: string) {
    this.socket?.emit('course:join', courseId);
  }

  // 离开课程房间
  leaveCourse(courseId: string) {
    this.socket?.emit('course:leave', courseId);
  }

  // 发送课程消息
  sendCourseMessage(courseId: string, message: string) {
    this.socket?.emit('course:message', { courseId, message });
  }

  // 监听课程消息
  onCourseMessage(callback: (data: any) => void) {
    this.socket?.on('course:message', callback);
  }

  // 加入协作会话
  joinCollaboration(projectId: string) {
    this.socket?.emit('collaboration:join', projectId);
  }

  // 离开协作会话
  leaveCollaboration(projectId: string) {
    this.socket?.emit('collaboration:leave', projectId);
  }

  // 发送代码更新
  sendCodeUpdate(projectId: string, code: string) {
    this.socket?.emit('collaboration:codeUpdate', { projectId, code });
  }

  // 监听代码更新
  onCodeUpdate(callback: (data: any) => void) {
    this.socket?.on('collaboration:codeUpdate', callback);
  }

  // 发送光标位置
  sendCursorPosition(projectId: string, cursor: { line: number; column: number }) {
    this.socket?.emit('collaboration:cursor', { projectId, cursor });
  }

  // 监听光标位置
  onCursorUpdate(callback: (data: any) => void) {
    this.socket?.on('collaboration:cursor', callback);
  }

  // 监听用户加入协作
  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('collaboration:userJoined', callback);
  }

  // 监听用户离开协作
  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('collaboration:userLeft', callback);
  }

  // 监听用户上线
  onUserOnline(callback: (data: any) => void) {
    this.socket?.on('user:online', callback);
  }

  // 监听用户下线
  onUserOffline(callback: (data: any) => void) {
    this.socket?.on('user:offline', callback);
  }

  // 监听通知
  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification:receive', callback);
  }

  // 发送通知
  sendNotification(userId: string, type: string, message: string, link?: string) {
    this.socket?.emit('notification:send', { userId, type, message, link });
  }

  // 移除监听器
  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export default new SocketService();
