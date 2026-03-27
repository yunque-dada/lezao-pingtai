import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  teacher: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  coverImage?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  category: string;
  tags: string[];
  duration: number;
  lessons: mongoose.Types.ObjectId[];
  enrolledCount: number;
  completedCount: number;
  rating: number;
  ratingCount: number;
  prerequisites: string[];
  objectives: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    coverImage: {
      type: String,
      default: ''
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    duration: {
      type: Number,
      default: 0,
      min: 0
    },
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    enrolledCount: {
      type: Number,
      default: 0,
      min: 0
    },
    completedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    },
    prerequisites: [{
      type: String,
      trim: true
    }],
    objectives: [{
      type: String,
      trim: true
    }],
    publishedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, status: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ teacher: 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
