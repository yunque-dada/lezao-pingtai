import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  order: number;
  type: 'video' | 'scratch' | 'quiz' | 'document';
  content: string;
  videoUrl?: string;
  scratchProject?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema: Schema = new Schema(
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
      maxlength: 500
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    type: {
      type: String,
      enum: ['video', 'scratch', 'quiz', 'document'],
      default: 'video'
    },
    content: {
      type: String,
      required: true
    },
    videoUrl: {
      type: String,
      default: ''
    },
    scratchProject: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model<ILesson>('Lesson', lessonSchema);
