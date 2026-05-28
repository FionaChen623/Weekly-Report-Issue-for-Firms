/**
 * 周报系统 - 共享数据类型定义
 */

// 用户角色: admin-领导/管理员, leader-小组长, member-普通员工
export type UserRole = 'admin' | 'leader' | 'member';

// 任务状态
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';

// 任务优先级
export type TaskPriority = 'low' | 'medium' | 'high';

// 周报状态
export type ReportStatus = 'draft' | 'submitted' | 'reviewed' | 'needs_revision';

// 用户信息
export interface IUser {
  id: string;
  name: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  email?: string;
}

// 任务信息
export interface ITask {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // ISO date
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  relatedReportIds?: string[];
  history?: ITaskHistory[];
}

// 任务历史记录
export interface ITaskHistory {
  id: string;
  taskId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  operatorId: string;
  operatorName: string;
  createdAt: string;
  timestamp?: string;
}

// 周报信息
export interface IReport {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  weekNumber: number;
  year: number;
  periodStart: string;
  periodEnd: string;
  content: {
    summary: string;
    plan: string;
    issues?: string;
  };
  relatedTaskIds?: string[];
  status: ReportStatus;
  submittedAt?: string;

  // 组长审核信息
  leaderReviewed?: boolean;
  leaderReviewedBy?: string;
  leaderReviewedByName?: string;
  leaderReviewedAt?: string;
  leaderReviewComments?: string;

  // 管理员审核信息
  reviewedBy?: string;
  reviewedByName?: string;
  reviewComments?: string;
}

// 团队成员
export interface ITeamMember {
  id: string;
  name: string;
  department: string;
  smallGroup: string; // 所属小组（细粒度）
  role: UserRole;
  email: string;
  joinDate: string;
  isActive: boolean;
  avatar?: string;
  groupId: string | null; // 所属大组ID
}

// 提醒设置
export interface IReminderSettings {
  weeklyReportDeadline: {
    dayOfWeek: number; // 0-6, 0=Sunday
    hour: number;
    minute: number;
  };
  // 首次提醒（截止前）
  preDeadlineReminder: {
    enabled: boolean;
    hoursBefore: number;
    dayOfWeek?: number; // 指定星期几提醒
    minute?: number;
  };
  // 二次提醒（周日检查）
  secondReminder?: {
    enabled: boolean;
    dayOfWeek: number;
    hour: number;
    minute: number;
    target: 'all' | 'unsubmitted_only';
  };
  // 逾期提醒（截止后）
  postDeadlineReminder: {
    enabled: boolean;
    hoursAfter: number;
    repeatDaily: boolean;
  };
  taskDueReminder: {
    enabled: boolean;
    daysBefore: number;
  };
  taskOverdueReminder: {
    enabled: boolean;
    repeatDaily: boolean;
  };
}

// 分组信息
export interface IGroup {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  department: string; // 所属部门
  memberCount: number;
  description?: string;
  createdAt: string;
}

// 组成员关系
export interface IGroupMember {
  groupId: string;
  userId: string;
  userName: string;
  joinedAt: string;
}

// 组统计数据
export interface IGroupStats {
  groupId: string;
  groupName: string;
  leaderName: string;
  department: string;
  memberCount: number;
  taskCompletionRate: number;
  weeklySubmissionRate: number;
  overdueTaskCount: number;
  pendingReportCount: number;
}

// 仪表盘统计数据
export interface IDashboardStats {
  weeklySubmissionRate: number;
  submittedCount: number;
  totalMemberCount: number;
  overdueTaskCount: number;
  pendingReviewCount: number;
  weeklyActivityData: {
    week: string;
    submissions: number;
  }[];
  // 管理端新增分组统计
  groupStats?: IGroupStats[];
}

// 角色视图类型
export type RoleView = 'member' | 'leader' | 'admin';
