import { IUser } from '../models/User';
import { ITeacher } from '../models/Teacher';
import { IStudent } from '../models/Student';
import { ICourse } from '../models/Course';
import { ILesson } from '../models/Lesson';
import { ILessonProgress } from '../models/LessonProgress';
import { IProject } from '../models/Project';
import { ISprite } from '../models/Sprite';
import { IBackdrop } from '../models/Backdrop';
import { ISound } from '../models/Sound';

export type {
  IUser,
  ITeacher,
  IStudent,
  ICourse,
  ILesson,
  ILessonProgress,
  IProject,
  ISprite,
  IBackdrop,
  ISound
};

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ICourseProgress {
  course: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  timeSpent: number;
}
