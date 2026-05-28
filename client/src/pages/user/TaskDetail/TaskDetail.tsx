import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  PlayCircleIcon,
  CircleIcon,
  FlagIcon,
  CalendarIcon,
  FileTextIcon
} from 'lucide-react';
import { taskList } from '@shared/static/mockData';
import type { ITask, TaskStatus, TaskPriority } from '@/types';

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
    label: '低优先级',
    color: 'text-muted-foreground',
  },
  medium: {
    label: '中优先级',
    color: 'text-warning',
  },
  high: {
    label: '高优先级',
    color: 'text-destructive',
  },
};

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<ITask | undefined>(
    taskList.find((t) => t.id === id) as ITask | undefined
  );
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);

  if (!task) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">任务不存在</h2>
          <p className="text-muted-foreground">该任务可能已被删除或您没有访问权限</p>
          <Button asChild variant="outline">
            <Link to="/tasks">
              <ArrowLeftIcon className="size-4 mr-2" />
              返回任务列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];
  const StatusIcon = status.icon;

  const isOverdue = () => {
    if (task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  const handleProgressChange = () => {
    const newProgress = tempProgress;
    setTask({
      ...task,
      progress: newProgress,
      status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'todo',
      updatedAt: new Date().toISOString().split('T')[0],
    });
    setIsEditingProgress(false);
  };

  const startEditingProgress = () => {
    setTempProgress(task.progress);
    setIsEditingProgress(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 头部导航 */}
      <section className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks">
            <ArrowLeftIcon className="size-4 mr-2" />
            返回
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">任务详情</h1>
      </section>

      {/* 任务基本信息卡片 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold text-foreground">{task.title}</h2>
                <Badge variant="secondary" className={`${status.bgColor} ${status.color} border-0`}>
                  <StatusIcon className="size-3 mr-1" />
                  {status.label}
                </Badge>
                {isOverdue() && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircleIcon className="size-3 mr-1" />
                    已逾期
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className={`flex items-center gap-1 ${priority.color}`}>
                  <FlagIcon className="size-3.5" />
                  {priority.label}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="size-3.5" />
                  截止日期: {formatDate(task.deadline)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 任务描述 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileTextIcon className="size-4 text-muted-foreground" />
              任务描述
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description || '暂无描述'}
            </p>
          </div>

          {/* 进度管理 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">任务进度</h3>
              {!isEditingProgress && task.status !== 'completed' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={startEditingProgress}
                >
                  更新进度
                </Button>
              )}
            </div>

            {isEditingProgress ? (
              <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">调整进度</span>
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
                    className="h-8 text-xs"
                    onClick={() => setIsEditingProgress(false)}
                  >
                    取消
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={handleProgressChange}
                  >
                    确认
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">当前进度</span>
                  <span className={task.progress === 100 ? 'text-success font-medium' : 'font-medium'}>
                    {task.progress}%
                  </span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
            )}
          </div>

          {/* 关联周报 */}
          {task.relatedReportIds && task.relatedReportIds.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileTextIcon className="size-4 text-muted-foreground" />
                关联周报
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.relatedReportIds.map((reportId) => (
                  <Badge key={reportId} variant="outline" className="text-xs">
                    周报 #{reportId.replace('report-', '')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 时间线 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">任务时间线</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div className="w-px h-full bg-border" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium text-foreground">任务创建</p>
                <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
              </div>
            </div>
            
            {task.status !== 'todo' && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-px h-full bg-border" />
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">开始执行</p>
                  <p className="text-xs text-muted-foreground">进度更新至 {task.progress}%</p>
                </div>
              </div>
            )}

            {task.status === 'completed' && (
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success">任务完成</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetail;
