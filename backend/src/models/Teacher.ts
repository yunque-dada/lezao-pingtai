import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacher extends Document {
  user: mongoose.Types.ObjectId;
  courses: mongoose.Types.ObjectId[];
  students: mongoose.Types.ObjectId[];
  specialization: string[];
  education: string;
  experience: number;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  introduction: string;
  certificates: string[];
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const teacherSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    courses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'Student'
    }],
    specialization: [{
      type: String,
      trim: true
    }],
    education: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    experience: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    introduction: {
      type: String,
      maxlength: 500,
      default: ''
    },
    certificates: [{
      type: String
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

teacherSchema.index({ user: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ rating: -1 });

export default mongoose.model<ITeacher>('Teacher', teacherSchema);
