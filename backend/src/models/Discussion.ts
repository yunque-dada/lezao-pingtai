import mongoose, { Document, Schema } from 'mongoose';

export interface IReply {
  _id?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
}

export interface IDiscussion extends Document {
  course: mongoose.Types.ObjectId;
  lesson?: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'student' | 'teacher' | 'admin';
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  views: number;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  replies: IReply[];
  replyCount: number;
  lastReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema: Schema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

const DiscussionSchema: Schema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorAvatar: {
      type: String,
    },
    authorRole: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    replies: [ReplySchema],
    replyCount: {
      type: Number,
      default: 0,
    },
    lastReplyAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
DiscussionSchema.index({ course: 1, createdAt: -1 });
DiscussionSchema.index({ course: 1, isPinned: -1, lastReplyAt: -1 });
DiscussionSchema.index({ author: 1 });
DiscussionSchema.index({ title: 'text', content: 'text', tags: 1 });

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
