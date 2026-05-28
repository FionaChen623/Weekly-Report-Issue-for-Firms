import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleIcon,
  FlagIcon,
  EyeIcon,
  BellIcon,
} from 'lucide-react';
import { taskList, teamMembers } from '@shared/static/mockData';
import type { ITask, TaskStatus, TaskPriority } from '@/types';
import { logger } from '@lark-apaas/client-toolkit/logger';

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; icon: typeof CircleIcon }> = {
  todo: {
    label: '未开始',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: CircleIcon,
  },
  in_progress: {
    label: '进行中',
    color: 'text-primary',
    bgColor: 'bg-primary',
    icon: ClockIcon,
  },
  completed: {
    label: '已完成',
    color: 'text-success',
    bgColor: 'bg-success',
    icon: CheckCircleIcon,
  },
  overdue: {
    label: '已逾期',
    color: 'text-destructive',
    bgColor: 'bg-destructive',
    icon: AlertCircleIcon,
  },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: {
    label: '低',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  medium: {
    label: '中',
    color: 'text-warning',
    bgColor: 'bg-warning-bg',
  },
  high: {
    label: '高',
    color: 'text-destructive',
    bgColor: 'bg-danger-bg',
  },
};

interface TaskListSectionProps {
  tasks?: ITask[];
}

const TaskListSection = ({ tasks: propTasks }: TaskListSectionProps) => {
  const navigate = useNavigate();
  const [internalTasks] = useState<ITask[]>(taskList as ITask[]);
  const tasks = propTasks || internalTasks;

  const handleViewDetail = (taskId: string) => {
    navigate(`/admin/tasks/${taskId}`);
  };

  const handleSendReminder = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    // 发送提醒逻辑
    logger.info('发送提醒:', String(taskId));
  };

  const getAssigneeAvatar = (assigneeId: string) => {
    const member = teamMembers.find((m) => m.id === assigneeId);
    return member?.name.charAt(0) || '?';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isOverdue = (deadline: string, status: TaskStatus) => {
    if (status === 'completed') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <section className="w-full space-y-4">
      {tasks.map((task) => {
        const status = statusConfig[task.status];
        const priority = priorityConfig[task.priority];
        const StatusIcon = status.icon;
        const overdue = isOverdue(task.deadline, task.status);

        return (
          <Card
            key={task.id}
            className="group cursor-pointer transition-all hover:shadow-md"
            onClick={() => handleViewDetail(task.id)}
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* 左侧状态色条 */}
                <div
                  className={`w-1 rounded-l-lg ${status.bgColor} ${overdue ? 'bg-destructive' : ''}`}
                />

                <div className="flex-1 p-4">
                  {/* 第一行：标题 + 优先级 + 状态 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground truncate">
                          {task.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`${priority.bgColor} ${priority.color} border-0`}
                        >
                          <FlagIcon className="w-3 h-3 mr-1" />
                          {priority.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`${status.bgColor}/10 ${status.color} border-0`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* 第二行：负责人 + 截止日期 + 进度 */}
                  <div className="flex items-center justify-between mt-4 gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {/* 负责人 */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                          {getAssigneeAvatar(task.assigneeId)}
                        </div>
                        <span>{task.assigneeName}</span>
                      </div>

                      {/* 截止日期 */}
                      <div className={`flex items-center gap-1 ${overdue ? 'text-destructive' : ''}`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{formatDate(task.deadline)}</span>
                        {overdue && <span className="text-xs">(已逾期)</span>}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      {overdue && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleSendReminder(e, task.id)}
                        >
                          <BellIcon className="w-4 h-4 mr-1" />
                          提醒
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(task.id);
                        }}
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        详情
                      </Button>
                    </div>
                  </div>

                  {/* 进度条 */}
                  {task.status !== 'completed' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>进度</span>
                        <span>{task.progress}%</span>
                      </div>
                      <Progress
                        value={task.progress}
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {tasks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <CheckCircleIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无任务</p>
              <p className="text-sm mt-1">点击上方"新建任务"按钮创建</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default TaskListSection;
