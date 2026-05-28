import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  CircleIcon,
  PlayCircleIcon,
  FlagIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { taskList } from '@shared/static/mockData';
import type { ITask, TaskStatus, TaskPriority } from '@/types';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';

const statusConfig: Record<TaskStatus, { label: string; color: string; bgColor: string; icon: typeof CircleIcon }> = {
  todo: {
    label: '待办',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: CircleIcon,
  },
  in_progress: {
    label: '进行中',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    icon: PlayCircleIcon,
  },
  completed: {
    label: '已完成',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: CheckCircleIcon,
  },
  overdue: {
    label: '已逾期',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: AlertCircleIcon,
  },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: {
    label: '低',
    color: 'text-muted-foreground',
  },
  medium: {
    label: '中',
    color: 'text-warning',
  },
  high: {
    label: '高',
    color: 'text-destructive',
  },
};

const UserTaskListSection = () => {
  const navigate = useNavigate();
  const currentUser = useCurrentUserProfile();
  const [tasks, setTasks] = useState<ITask[]>(
    taskList.filter((task) => task.assigneeId === currentUser.user_id) as ITask[]
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [tempProgress, setTempProgress] = useState<number>(0);

  const handleProgressChange = (taskId: string, newProgress: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'todo',
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : task
      )
    );
    setEditingTaskId(null);
  };

  const startEditingProgress = (task: ITask) => {
    setEditingTaskId(task.id);
    setTempProgress(task.progress);
  };

  const groupedTasks = {
    in_progress: tasks.filter((t) => t.status === 'in_progress' || t.status === 'overdue'),
    todo: tasks.filter((t) => t.status === 'todo'),
    completed: tasks.filter((t) => t.status === 'completed'),
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isOverdue = (deadline: string, status: TaskStatus) => {
    if (status === 'completed') return false;
    return new Date(deadline) < new Date();
  };

  const TaskCard = ({ task }: { task: ITask }) => {
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];
    const StatusIcon = status.icon;
    const overdue = isOverdue(task.deadline, task.status);

    return (
      <Card 
        className={`group transition-all hover:shadow-md cursor-pointer ${overdue ? 'border-destructive/50' : ''}`}
        onClick={() => navigate(`/tasks/${task.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div
              className={`w-1 shrink-0 rounded-l ${
                task.status === 'overdue' || overdue
                  ? 'bg-destructive'
                  : task.status === 'completed'
                  ? 'bg-success'
                  : task.status === 'in_progress'
                  ? 'bg-primary'
                  : 'bg-muted-foreground'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                    <FlagIcon className={`size-3.5 ${priority.color}`} />
                    {overdue && (
                      <Badge variant="destructive" className="text-xs shrink-0">
                        <AlertCircleIcon className="size-3 mr-1" />
                        逾期
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                </div>
                <Badge variant="secondary" className={`${status.bgColor} ${status.color} border-0 shrink-0`}>
                  <StatusIcon className="size-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-3 gap-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className={`flex items-center gap-1 ${overdue ? 'text-destructive' : ''}`}>
                    <ClockIcon className="size-3.5" />
                    <span>{formatDate(task.deadline)}</span>
                  </div>
                </div>

                {task.status !== 'completed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingProgress(task);
                    }}
                  >
                    更新进度
                    <ChevronRightIcon className="size-3 ml-1" />
                  </Button>
                )}
              </div>

              {editingTaskId === task.id ? (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>调整进度</span>
                    <span className="font-medium text-primary">{tempProgress}%</span>
                  </div>
                  <Slider
                    value={[tempProgress]}
                    onValueChange={(value) => setTempProgress(value[0])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditingTaskId(null)}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleProgressChange(task.id, tempProgress)}
                    >
                      确认
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>进度</span>
                    <span className={task.progress === 100 ? 'text-success font-medium' : ''}>
                      {task.progress}%
                    </span>
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
  };

  return (
    <section className="w-full space-y-6">
      {groupedTasks.in_progress.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <PlayCircleIcon className="size-4 text-primary" />
            进行中 ({groupedTasks.in_progress.length})
          </h3>
          <div className="space-y-3">
            {groupedTasks.in_progress.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {groupedTasks.todo.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CircleIcon className="size-4 text-muted-foreground" />
            待办 ({groupedTasks.todo.length})
          </h3>
          <div className="space-y-3">
            {groupedTasks.todo.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {groupedTasks.completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircleIcon className="size-4 text-success" />
            已完成 ({groupedTasks.completed.length})
          </h3>
          <div className="space-y-3">
            {groupedTasks.completed.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <CheckCircleIcon className="size-12 opacity-50" />
              <p>暂无任务</p>
              <p className="text-sm">请联系管理员分配任务</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default UserTaskListSection;
