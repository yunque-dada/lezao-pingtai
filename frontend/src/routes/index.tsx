import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import PrivateRoute from './PrivateRoute';

const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>加载中...</p>
  </div>
);

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const NotFound = lazy(() => import('../pages/NotFound'));

const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard'));
const CourseList = lazy(() => import('../pages/teacher/CourseList'));
const CourseCreate = lazy(() => import('../pages/teacher/CourseCreate'));
const CourseEdit = lazy(() => import('../pages/teacher/CourseEdit'));
const CourseStats = lazy(() => import('../pages/teacher/CourseStats'));
const StudentList = lazy(() => import('../pages/teacher/StudentList'));
const StudentDetail = lazy(() => import('../pages/teacher/StudentDetail'));
const WorkList = lazy(() => import('../pages/teacher/WorkList'));
const WorkDetail = lazy(() => import('../pages/teacher/WorkDetail'));
const WorkReview = lazy(() => import('../pages/teacher/WorkReview'));
const TeacherScratchProjectList = lazy(() => import('../pages/teacher/ScratchProjectList'));

const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const CourseCenter = lazy(() => import('../pages/student/CourseCenter'));
const MyCourses = lazy(() => import('../pages/student/MyCourses'));
const WorkCenter = lazy(() => import('../pages/student/WorkCenter'));
const MyWorks = lazy(() => import('../pages/student/MyWorks'));
const WorkCreate = lazy(() => import('../pages/student/WorkCreate'));
const ScratchProjectList = lazy(() => import('../pages/student/ScratchProjectList'));
const ScratchEditor = lazy(() => import('../pages/student/ScratchEditor'));
const CourseLearning = lazy(() => import('../pages/student/CourseLearning'));

const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const TeacherManagement = lazy(() => import('../pages/admin/TeacherManagement'));
const StudentManagement = lazy(() => import('../pages/admin/StudentManagement'));
const CourseManagement = lazy(() => import('../pages/admin/CourseManagement'));
const WorkManagement = lazy(() => import('../pages/admin/WorkManagement'));
const ScratchSprites = lazy(() => import('../pages/admin/ScratchSprites'));
const ScratchBackdrops = lazy(() => import('../pages/admin/ScratchBackdrops'));
const ScratchSounds = lazy(() => import('../pages/admin/ScratchSounds'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const SystemSettings = lazy(() => import('../pages/admin/SystemSettings'));
const ScratchProjectManagement = lazy(() => import('../pages/admin/ScratchProjectManagement'));

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
          }
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <TeacherDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <CourseList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/courses/create"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <CourseCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/courses/edit/:id"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <CourseEdit />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/courses/stats/:id"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <CourseStats />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <StudentList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/students/:id"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <StudentDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/works"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <WorkList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/works/:id"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <WorkDetail />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/works/:id/review"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <WorkReview />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher/scratch-projects"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <Layout>
                <TeacherScratchProjectList />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
              <Layout>
                <StudentDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
              <Layout>
                <CourseCenter />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/my-courses"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <Layout>
                <MyCourses />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/works"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
              <Layout>
                <WorkCenter />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/my-works"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <Layout>
                <MyWorks />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/works/create"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <Layout>
                <WorkCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/scratch/editor/:projectId"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
              <Layout>
                <ScratchEditor />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/scratch-projects"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'admin']}>
              <Layout>
                <ScratchProjectList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/student/courses/:courseId/learn"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <Layout>
                <CourseLearning />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <TeacherManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <StudentManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <CourseManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/works"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <WorkManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/scratch/sprites"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <ScratchSprites />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/scratch/backdrops"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <ScratchBackdrops />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/scratch/sounds"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <ScratchSounds />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <SystemSettings />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/scratch/projects"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Layout>
                <ScratchProjectManagement />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
