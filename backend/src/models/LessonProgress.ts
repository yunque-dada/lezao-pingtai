import mongoose, { Document, Schema } from 'mongoose';

export interface ILessonProgress extends Document {
  student: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  timeSpent: number;
  lastAccessAt: Date;
  completedAt?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema: Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    lastAccessAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

lessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ student: 1, course: 1 });
lessonProgressSchema.index({ status: 1 });

export default mongoose.model<ILessonProgress>('LessonProgress', lessonProgressSchema);
