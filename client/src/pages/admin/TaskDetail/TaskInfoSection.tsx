import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ClockIcon,
  CalendarIcon,
  UserIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CircleIcon,
  PlayCircleIcon,
  FlagIcon,
} from 'lucide-react';
import type { ITask, TaskStatus, TaskPriority } from '@/types';

interface ITaskInfoSectionProps {
  task: ITask;
}

const statusConfig: Record<TaskStatus, { label: string; icon: typeof CircleIcon; color: string; bgColor: string }> = {
  todo: {
    label: '未开始',
    icon: CircleIcon,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  in_progress: {
    label: '进行中',
    icon: PlayCircleIcon,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  completed: {
    label: '已完成',
    icon: CheckCircleIcon,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  overdue: {
    label: '已逾期',
    icon: AlertCircleIcon,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
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
    bgColor: 'bg-warning/10',
  },
  high: {
    label: '高',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
  },
};

const TaskInfoSection: React.FC<ITaskInfoSectionProps> = ({ task }) => {
  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  return (
    <section className="w-full">
      <Card className="border-l-4" style={{ borderLeftColor: task.status === 'overdue' ? 'hsl(0 72% 51%)' : task.status === 'completed' ? 'hsl(142 71% 45%)' : task.status === 'in_progress' ? 'hsl(25 95% 53%)' : 'hsl(222 12% 45%)' }}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl font-semibold text-foreground mb-2">
                {task.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`${status.bgColor} ${status.color} border-0 gap-1`}>
                  <StatusIcon className="size-3.5" />
                  {status.label}
                </Badge>
                <Badge variant="outline" className={`${priority.bgColor} ${priority.color} border-0 gap-1`}>
                  <FlagIcon className="size-3.5" />
                  {priority.label}优先级
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 任务描述 */}
          {task.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">任务描述</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* 任务元信息 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                <UserIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">负责人</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(task.assigneeName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{task.assigneeName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                <CalendarIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">截止日期</p>
                <p className={`text-sm font-medium mt-0.5 ${task.status === 'overdue' ? 'text-destructive' : 'text-foreground'}`}>
                  {formatDate(task.deadline)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                <ClockIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">创建时间</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
                <ClockIcon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">最后更新</p>
                <p className="text-sm font-medium text-foreground mt-0.5">
                  {formatDate(task.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">完成进度</h4>
              <span className={`text-sm font-semibold ${task.progress === 100 ? 'text-success' : 'text-primary'}`}>
                {task.progress}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={task.progress} 
                className="h-2.5"
              />
              <div 
                className="absolute top-0 left-0 h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${task.progress}%`,
                  background: 'linear-gradient(90deg, hsl(25 95% 70%), hsl(25 95% 53%))'
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {task.progress === 0 && '任务尚未开始'}
              {task.progress > 0 && task.progress < 100 && `已完成 ${task.progress}%，继续加油！`}
              {task.progress === 100 && '任务已完成'}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TaskInfoSection;
