import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  user: mongoose.Types.ObjectId;
  enrolledCourses: mongoose.Types.ObjectId[];
  completedCourses: mongoose.Types.ObjectId[];
  projects: mongoose.Types.ObjectId[];
  grade: string;
  school: string;
  parentName: string;
  parentPhone: string;
  points: number;
  level: number;
  achievements: string[];
  learningStreak: number;
  lastLearningDate: Date;
  totalLearningTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    enrolledCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    completedCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course'
    }],
    projects: [{
      type: Schema.Types.ObjectId,
      ref: 'Project'
    }],
    grade: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ''
    },
    school: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ''
    },
    parentName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: ''
    },
    parentPhone: {
      type: String,
      trim: true,
      default: ''
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    achievements: [{
      type: String
    }],
    learningStreak: {
      type: Number,
      default: 0
    },
    lastLearningDate: {
      type: Date,
      default: null
    },
    totalLearningTime: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

studentSchema.index({ user: 1 });
studentSchema.index({ points: -1 });
studentSchema.index({ level: 1 });

studentSchema.methods.addPoints = function(points: number) {
  this.points += points;
  this.level = Math.floor(this.points / 100) + 1;
  return this.save();
};

studentSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastDate = this.lastLearningDate ? new Date(this.lastLearningDate) : null;
  if (lastDate) {
    lastDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.learningStreak += 1;
    } else if (diffDays > 1) {
      this.learningStreak = 1;
    }
  } else {
    this.learningStreak = 1;
  }
  
  this.lastLearningDate = today;
  return this.save();
};

export default mongoose.model<IStudent>('Student', studentSchema);
