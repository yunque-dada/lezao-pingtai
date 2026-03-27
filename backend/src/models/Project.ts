import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  author: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId;
  scratchData: string;
  thumbnail?: string;
  isPublic: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  likes: number;
  views: number;
  score?: number;
  comment?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isFeatured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      default: '',
      maxlength: 500
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    },
    scratchData: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft'
    },
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    comment: {
      type: String,
      maxlength: 1000
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

projectSchema.index({ author: 1, status: 1 });
projectSchema.index({ course: 1, status: 1 });
projectSchema.index({ status: 1, isFeatured: -1 });
projectSchema.index({ createdAt: -1 });

export default mongoose.model<IProject>('Project', projectSchema);
