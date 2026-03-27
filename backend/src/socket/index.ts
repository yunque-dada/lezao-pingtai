import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface AuthenticatedSocket extends Socket {
  user?: IUser;
}

// 存储在线用户
const onlineUsers = new Map<string, { socketId: string; userId: string; username: string }>();

// 存储协作会话
const collaborationSessions = new Map<string, {
  projectId: string;
  users: Set<string>;
  code: string;
}>();

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 认证中间件
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.user?.username} (${socket.id})`);

    // 记录在线用户
    if (socket.user) {
      onlineUsers.set(socket.user._id.toString(), {
        socketId: socket.id,
        userId: socket.user._id.toString(),
        username: socket.user.username,
      });

      // 广播用户上线
      io.emit('user:online', {
        userId: socket.user._id.toString(),
        username: socket.user.username,
      });
    }

    // 加入课程房间
    socket.on('course:join', (courseId: string) => {
      socket.join(`course:${courseId}`);
      console.log(`${socket.user?.username} joined course ${courseId}`);
    });

    // 离开课程房间
    socket.on('course:leave', (courseId: string) => {
      socket.leave(`course:${courseId}`);
      console.log(`${socket.user?.username} left course ${courseId}`);
    });

    // 发送课程消息
    socket.on('course:message', (data: { courseId: string; message: string }) => {
      const { courseId, message } = data;
      io.to(`course:${courseId}`).emit('course:message', {
        userId: socket.user?._id.toString(),
        username: socket.user?.username,
        message,
        timestamp: new Date(),
      });
    });

    // 加入协作会话
    socket.on('collaboration:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      
      if (!collaborationSessions.has(projectId)) {
        collaborationSessions.set(projectId, {
          projectId,
          users: new Set(),
          code: '',
        });
      }

      const session = collaborationSessions.get(projectId)!;
      session.users.add(socket.user?._id.toString() || '');

      // 通知其他用户
      socket.to(`project:${projectId}`).emit('collaboration:userJoined', {
        userId: socket.user?._id.toString(),
        username: socket.user?.username,
      });

      // 发送当前代码给新用户
      socket.emit('collaboration:code', session.code);

      console.log(`${socket.user?.username} joined collaboration ${projectId}`);
    });

    // 离开协作会话
    socket.on('collaboration:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      
      const session = collaborationSessions.get(projectId);
      if (session) {
        session.users.delete(socket.user?._id.toString() || '');
        
        // 通知其他用户
        socket.to(`project:${projectId}`).emit('collaboration:userLeft', {
          userId: socket.user?._id.toString(),
          username: socket.user?.username,
        });

        // 如果没有用户了，删除会话
        if (session.users.size === 0) {
          collaborationSessions.delete(projectId);
        }
      }

      console.log(`${socket.user?.username} left collaboration ${projectId}`);
    });

    // 代码更新
    socket.on('collaboration:codeUpdate', (data: { projectId: string; code: string }) => {
      const { projectId, code } = data;
      
      const session = collaborationSessions.get(projectId);
      if (session) {
        session.code = code;
        
        // 广播给房间内的其他用户（不包括发送者）
        socket.to(`project:${projectId}`).emit('collaboration:codeUpdate', {
          code,
          userId: socket.user?._id.toString(),
          username: socket.user?.username,
        });
      }
    });

    // 光标位置更新
    socket.on('collaboration:cursor', (data: { 
      projectId: string; 
      cursor: { line: number; column: number };
    }) => {
      const { projectId, cursor } = data;
      
      socket.to(`project:${projectId}`).emit('collaboration:cursor', {
        userId: socket.user?._id.toString(),
        username: socket.user?.username,
        cursor,
      });
    });

    // 发送通知
    socket.on('notification:send', (data: { 
      userId: string; 
      type: string; 
      message: string;
      link?: string;
    }) => {
      const targetUser = onlineUsers.get(data.userId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('notification:receive', {
          type: data.type,
          message: data.message,
          link: data.link,
          timestamp: new Date(),
        });
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.username} (${socket.id})`);
      
      if (socket.user) {
        onlineUsers.delete(socket.user._id.toString());
        
        // 广播用户下线
        io.emit('user:offline', {
          userId: socket.user._id.toString(),
          username: socket.user.username,
        });
      }
    });
  });

  return io;
};

// 获取在线用户列表
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.values());
};

// 获取协作会话信息
export const getCollaborationSession = (projectId: string) => {
  return collaborationSessions.get(projectId);
};
