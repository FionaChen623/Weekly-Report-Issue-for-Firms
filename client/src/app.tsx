import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';

// 管理端页面
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import TaskManagement from './pages/admin/TaskManagement/TaskManagement';
import TaskDetail from './pages/admin/TaskDetail/TaskDetail';
import WeeklyReportReview from './pages/admin/WeeklyReportReview/WeeklyReportReview';
import ReportDetail from './pages/admin/ReportDetail/ReportDetail';
import TeamManagement from './pages/admin/TeamManagement/TeamManagement';
import ReminderSettings from './pages/admin/ReminderSettings/ReminderSettings';

// 组长端页面
import LeaderDashboard from './pages/leader/LeaderDashboard/LeaderDashboard';
import LeaderTaskManagement from './pages/leader/LeaderTaskManagement/LeaderTaskManagement';
import LeaderReportCollection from './pages/leader/LeaderReportCollection/LeaderReportCollection';
import LeaderMemberManagement from './pages/leader/LeaderMemberManagement/LeaderMemberManagement';
import LeaderReportReview from './pages/leader/LeaderReportReview/LeaderReportReview';
import LeaderReportDetail from './pages/leader/LeaderReportDetail/LeaderReportDetail';

// 用户端页面
import MyReports from './pages/user/MyReports/MyReports';
import WriteReport from './pages/user/WriteReport/WriteReport';
import EditReport from './pages/user/EditReport/EditReport';
import MyTasks from './pages/user/MyTasks/MyTasks';
import UserTaskDetail from './pages/user/TaskDetail/TaskDetail';
import UserSettings from './pages/user/UserSettings/UserSettings';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* 用户端首页 - 我的周报 */}
        <Route index element={<MyReports />} />
        
        {/* 用户端路由 */}
        <Route path="tasks" element={<MyTasks />} />
        <Route path="tasks/:id" element={<UserTaskDetail />} />
        <Route path="settings" element={<UserSettings />} />
        <Route path="report/new" element={<WriteReport />} />
        <Route path="report/edit/:id" element={<EditReport />} />
        
        {/* 组长端路由 */}
        <Route path="leader" element={<LeaderDashboard />} />
        {/* 组长个人模块 */}
        <Route path="leader/my-reports" element={<MyReports />} />
        <Route path="leader/my-tasks" element={<MyTasks />} />
        <Route path="leader/report/new" element={<WriteReport />} />
        <Route path="leader/report/edit/:id" element={<EditReport />} />
        {/* 组长管理团队模块 */}
        <Route path="leader/reports" element={<LeaderReportReview />} />
        <Route path="leader/team-reports" element={<LeaderReportReview />} />
        <Route path="leader/tasks" element={<LeaderTaskManagement />} />
        <Route path="leader/team-reports/:id" element={<LeaderReportDetail />} />
        <Route path="leader/team-tasks" element={<LeaderTaskManagement />} />
        <Route path="leader/members" element={<LeaderMemberManagement />} />
        
        {/* 管理端路由 */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/tasks" element={<TaskManagement />} />
        <Route path="admin/tasks/:id" element={<TaskDetail />} />
        <Route path="admin/reports" element={<WeeklyReportReview />} />
        <Route path="admin/reports/:id" element={<ReportDetail />} />
        <Route path="admin/team" element={<TeamManagement />} />
        <Route path="admin/groups" element={<Navigate to="/admin/team" replace />} />
        <Route path="admin/settings/reminders" element={<ReminderSettings />} />
      </Route>
      
      {/* 404 页面 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
