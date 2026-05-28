import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  CalendarIcon,
  UserIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { taskList, groupMembers, teamMembers } from '@shared/static/mockData';
import type { ITask, TaskStatus, TaskPriority } from '@/types';
import { logger } from '@lark-apaas/client-toolkit/logger';

// 模拟当前组长所属组
const CURRENT_GROUP_ID = 'group-001';
const CURRENT_USER_ID = 'user-002'; // 李开发

interface ILeaderTaskManagementProps {}

const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ElementType }> = {
  todo: { label: '未开始', color: 'bg-muted text-muted-foreground', icon: CircleIcon },
  in_progress: { label: '进行中', color: 'bg-primary/10 text-primary', icon: ClockIcon },
  completed: { label: '已完成', color: 'bg-success-bg text-success', icon: CheckCircleIcon },
  overdue: { label: '已逾期', color: 'bg-danger-bg text-danger', icon: AlertCircleIcon },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: '高', color: 'bg-danger-bg text-danger' },
  medium: { label: '中', color: 'bg-warning-bg text-warning' },
  low: { label: '低', color: 'bg-muted text-muted-foreground' },
};

const LeaderTaskManagement: React.FC<ILeaderTaskManagementProps> = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 获取组员列表（不包括组长自己）
  const groupMemberUsers = useMemo(() => {
    return groupMembers
      .filter(gm => gm.groupId === CURRENT_GROUP_ID && gm.userId !== CURRENT_USER_ID)
      .map(gm => teamMembers.find(tm => tm.id === gm.userId))
      .filter(Boolean);
  }, []);

  // 筛选组内任务
  const groupTasks = useMemo(() => {
    const groupMemberIds = groupMembers
      .filter(gm => gm.groupId === CURRENT_GROUP_ID)
      .map(gm => gm.userId);
    
    return taskList.filter(task => groupMemberIds.includes(task.assigneeId));
  }, []);

  // 应用筛选
  const filteredTasks = useMemo(() => {
    return groupTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [groupTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // 统计数据
  const stats = useMemo(() => {
    const total = groupTasks.length;
    const completed = groupTasks.filter(t => t.status === 'completed').length;
    const inProgress = groupTasks.filter(t => t.status === 'in_progress').length;
    const overdue = groupTasks.filter(t => t.status === 'overdue').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, overdue, completionRate };
  }, [groupTasks]);

  const handleCreateTask = () => {
    setIsCreateDialogOpen(true);
  };

  const handleTaskClick = (taskId: string) => {
    // 组长查看任务详情（可以编辑）
    logger.info('查看任务详情:', String(taskId));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAssigneeFilter('all');
  };

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">组任务管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              给组员布置任务，跟踪组内任务进度
            </p>
          </div>
          <Button onClick={handleCreateTask} className="gap-2">
            <PlusIcon className="size-4" />
            新建任务
          </Button>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">总任务数</div>
            <div className="text-2xl font-bold mt-1">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">已完成</div>
            <div className="text-2xl font-bold text-success mt-1">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">进行中</div>
            <div className="text-2xl font-bold text-primary mt-1">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">已逾期</div>
            <div className="text-2xl font-bold text-danger mt-1">{stats.overdue}</div>
          </CardContent>
        </Card>
      </section>

      {/* 完成率进度条 */}
      <section className="w-full">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">组任务完成率</span>
              <span className="text-sm font-bold text-primary">{stats.completionRate}%</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </CardContent>
        </Card>
      </section>

      {/* 筛选栏 */}
      <section className="w-full">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索任务标题或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="todo">未开始</SelectItem>
                    <SelectItem value="in_progress">进行中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="overdue">已逾期</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部优先级</SelectItem>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部成员</SelectItem>
                    {groupMemberUsers.map(member => (
                      <SelectItem key={member?.id} value={member?.id || ''}>
                        {member?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    清除筛选
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 任务列表 */}
      <section className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">任务列表 ({filteredTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FilterIcon className="size-12 mx-auto mb-4 opacity-30" />
                  <p>暂无符合条件的任务</p>
                  <Button variant="ghost" onClick={clearFilters} className="mt-2">
                    清除筛选条件
                  </Button>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const statusInfo = statusConfig[task.status];
                  const priorityInfo = priorityConfig[task.priority];
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* 状态指示条 */}
                        <div
                          className={`w-1 self-stretch rounded-full ${
                            task.status === 'completed'
                              ? 'bg-success'
                              : task.status === 'overdue'
                              ? 'bg-danger'
                              : task.status === 'in_progress'
                              ? 'bg-primary'
                              : 'bg-muted-foreground'
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground truncate">
                                {task.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {task.description}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <MoreHorizontalIcon className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>查看详情</DropdownMenuItem>
                                <DropdownMenuItem>编辑任务</DropdownMenuItem>
                                <DropdownMenuItem className="text-danger">删除任务</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <Badge variant="outline" className={statusInfo.color}>
                              <StatusIcon className="size-3 mr-1" />
                              {statusInfo.label}
                            </Badge>

                            <Badge variant="outline" className={priorityInfo.color}>
                              <FlagIcon className="size-3 mr-1" />
                              {priorityInfo.label}优先级
                            </Badge>

                            <span className="flex items-center text-xs text-muted-foreground">
                              <UserIcon className="size-3 mr-1" />
                              {task.assigneeName}
                            </span>

                            <span className="flex items-center text-xs text-muted-foreground">
                              <CalendarIcon className="size-3 mr-1" />
                              截止: {task.deadline}
                            </span>
                          </div>

                          {/* 进度条 */}
                          {task.status !== 'todo' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">进度</span>
                                <span className="font-medium">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 新建任务对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>新建任务</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                任务标题 <span className="text-danger">*</span>
              </Label>
              <Input id="title" placeholder="输入任务标题" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">任务描述</Label>
              <Textarea
                id="description"
                placeholder="输入任务详细描述..."
                className="min-h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">
                  负责人 <span className="text-danger">*</span>
                </Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="选择负责人" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupMemberUsers.map(member => (
                      <SelectItem key={member?.id} value={member?.id || ''}>
                        {member?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">
                  截止日期 <span className="text-danger">*</span>
                </Label>
                <Input id="deadline" type="date" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>优先级</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-1">
                  <ArrowDownIcon className="size-3" />
                  低
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1">
                  中
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1 text-danger">
                  <ArrowUpIcon className="size-3" />
                  高
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>创建任务</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderTaskManagement;
