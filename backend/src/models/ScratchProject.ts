import mongoose, { Document, Schema } from 'mongoose';

export interface IScratchProject extends Document {
  title: string;
  description?: string;
  projectData?: string;
  path: string;
  size: number;
  thumbnail?: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  isPublic: boolean;
  isFeatured: boolean;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  views: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ScratchProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    projectData: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    thumbnail: {
      type: String,
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
    isPublic: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

ScratchProjectSchema.index({ author: 1, createdAt: -1 });
ScratchProjectSchema.index({ isPublic: 1, isFeatured: 1, createdAt: -1 });
ScratchProjectSchema.index({ tags: 1 });
ScratchProjectSchema.index({ title: 1 });
ScratchProjectSchema.index({ description: 1 });

export default mongoose.model<IScratchProject>('ScratchProject', ScratchProjectSchema);
