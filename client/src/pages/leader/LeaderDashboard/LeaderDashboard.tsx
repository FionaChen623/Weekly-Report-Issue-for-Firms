import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  UsersIcon,
  CheckSquareIcon,
  FileTextIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
} from 'lucide-react';
import { dashboardStats, taskList, reportList, groupList, groupMembers, teamMembers } from '@shared/static/mockData';
import type { IGroupStats, ITask, IReport } from '@/types';

// 模拟当前组长所属组
const currentGroupId = 'group-001';

interface ILeaderDashboardProps {}

const LeaderDashboard: React.FC<ILeaderDashboardProps> = () => {
  const navigate = useNavigate();
  const currentProfile = useCurrentUserProfile();

  // 获取当前组的数据
  const groupData = useMemo(() => {
    const group = groupList.find(g => g.id === currentGroupId);
    const members = groupMembers.filter(gm => gm.groupId === currentGroupId);
    const memberIds = members.map(m => m.userId);
    const memberDetails = teamMembers.filter(tm => memberIds.includes(tm.id));
    
    // 组任务统计
    const groupTasks = taskList.filter(t => memberIds.includes(t.assigneeId));
    const completedTasks = groupTasks.filter(t => t.status === 'completed');
    const overdueTasks = groupTasks.filter(t => t.status === 'overdue');
    const inProgressTasks = groupTasks.filter(t => t.status === 'in_progress');
    
    // 组周报统计
    const groupReports = reportList.filter(r => memberIds.includes(r.authorId));
    const submittedReports = groupReports.filter(r => r.status === 'submitted' || r.status === 'reviewed');
    const pendingReports = groupReports.filter(r => r.status === 'draft');
    
    // 本周统计
    const thisWeekReports = groupReports.filter(r => r.weekNumber === 21);
    const thisWeekSubmittedCount = thisWeekReports.filter(r => r.status !== 'draft').length;
    const submissionRate = members.length > 0 ? Math.round((thisWeekSubmittedCount / members.length) * 100) : 0;
    
    // 任务完成率
    const taskCompletionRate = groupTasks.length > 0 
      ? Math.round((completedTasks.length / groupTasks.length) * 100) 
      : 0;

    return {
      group,
      members,
      memberDetails,
      groupTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
      groupReports,
      submittedReports,
      pendingReports,
      submissionRate,
      taskCompletionRate,
      totalMembers: members.length,
      thisWeekSubmitted: thisWeekSubmittedCount,
    };
  }, []);

  // 计算趋势（与上周比较）
  const taskTrend = useMemo(() => {
    return groupData.taskCompletionRate >= 70 ? 'up' : 'down';
  }, [groupData.taskCompletionRate]);

  const reportTrend = useMemo(() => {
    return groupData.submissionRate >= 80 ? 'up' : 'down';
  }, [groupData.submissionRate]);

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">组仪表盘</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {groupData.group?.name} · 共 {groupData.totalMembers} 人
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-warning border-warning">
              <ClockIcon className="size-3 mr-1" />
              第21周
            </Badge>
          </div>
        </div>
      </section>

      {/* 核心指标卡片 */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 成员数量 */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">组成员</p>
                <p className="text-3xl font-bold text-foreground mt-2">{groupData.totalMembers}</p>
                <p className="text-xs text-muted-foreground mt-1">人</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                <UsersIcon className="size-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 任务完成率 */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">任务完成率</p>
                <p className="text-3xl font-bold text-foreground mt-2">{groupData.taskCompletionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {taskTrend === 'up' ? (
                    <TrendingUpIcon className="size-3 text-success" />
                  ) : (
                    <TrendingDownIcon className="size-3 text-destructive" />
                  )}
                  <span className={`text-xs ${taskTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    本周
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                <CheckSquareIcon className="size-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 周报提交率 */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">周报提交率</p>
                <p className="text-3xl font-bold text-foreground mt-2">{groupData.submissionRate}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {reportTrend === 'up' ? (
                    <TrendingUpIcon className="size-3 text-success" />
                  ) : (
                    <TrendingDownIcon className="size-3 text-destructive" />
                  )}
                  <span className={`text-xs ${reportTrend === 'up' ? 'text-success' : 'text-destructive'}`}>
                    本周
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-info/10">
                <FileTextIcon className="size-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 逾期任务 */}
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">逾期任务</p>
                <p className="text-3xl font-bold text-destructive mt-2">{groupData.overdueTasks.length}</p>
                <p className="text-xs text-muted-foreground mt-1">需关注</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <AlertCircleIcon className="size-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 任务与周报进度 */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 任务进度 */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">本周任务进度</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => navigate('/leader/tasks')}
              >
                查看全部
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* 进行中任务 */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">进行中</span>
                  <span className="font-medium">{groupData.inProgressTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {groupData.inProgressTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.assigneeName}</p>
                      </div>
                      <Progress value={task.progress} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-10 text-right">{task.progress}%</span>
                    </div>
                  ))}
                  {groupData.inProgressTasks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">暂无进行中任务</p>
                  )}
                </div>
              </div>

              {/* 逾期任务提醒 */}
              {groupData.overdueTasks.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircleIcon className="size-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">逾期任务提醒</span>
                  </div>
                  <div className="space-y-2">
                    {groupData.overdueTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-destructive truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">负责人：{task.assigneeName}</p>
                        </div>
                        <Badge variant="destructive" className="shrink-0">已逾期</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 周报提交情况 */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">本周周报提交</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1"
                onClick={() => navigate('/leader/reports')}
              >
                查看全部
                <ArrowRightIcon className="size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* 提交进度 */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">提交进度</span>
                  <span className="font-medium">{groupData.submissionRate}%</span>
                </div>
                <Progress value={groupData.submissionRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  已提交 {groupData.thisWeekSubmitted} / {groupData.totalMembers} 人
                </p>
              </div>

              {/* 成员提交状态 */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-medium mb-3">成员状态</p>
                <div className="space-y-2">
                  {groupData.memberDetails.slice(0, 5).map((member) => {
                    const hasSubmitted = reportList.some(
                      r => r.authorId === member.id && r.weekNumber === 21 && r.status !== 'draft'
                    );
                    return (
                      <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium">{member.name}</span>
                        </div>
                        <Badge 
                          variant={hasSubmitted ? "default" : "secondary"}
                          className={hasSubmitted ? "bg-success text-success-foreground" : ""}
                        >
                          {hasSubmitted ? '已提交' : '未提交'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                {groupData.totalMembers > 5 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => navigate('/leader/members')}
                  >
                    查看全部 {groupData.totalMembers} 名成员
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 快捷操作 */}
      <section className="w-full">
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">快捷操作：</span>
              <Button 
                size="sm" 
                onClick={() => navigate('/leader/tasks')}
              >
                <CheckSquareIcon className="size-4 mr-2" />
                布置任务
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/leader/reports')}
              >
                <FileTextIcon className="size-4 mr-2" />
                查看周报
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/leader/members')}
              >
                <UsersIcon className="size-4 mr-2" />
                管理成员
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default LeaderDashboard;
