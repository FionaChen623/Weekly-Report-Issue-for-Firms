import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquareIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  CircleIcon, 
  PlayCircleIcon,
  AlertCircleIcon,
  CalendarIcon,
  EyeIcon
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { taskList } from '@shared/static/mockData';
import type { TaskStatus, ITask } from '@/types';

const statusTabs: { key: TaskStatus | 'all' | 'overdue'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'todo', label: '待办' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'overdue', label: '已逾期' },
];

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

const priorityConfig = {
  low: { label: '低', color: 'text-muted-foreground' },
  medium: { label: '中', color: 'text-warning' },
  high: { label: '高', color: 'text-destructive' },
};

const MyTasks = () => {
  const [activeTab, setActiveTab] = useState<TaskStatus | 'all' | 'overdue'>('all');
  
  const currentUserId = 'user-002';
  
  const userTasks = useMemo(() => {
    return taskList.filter(task => task.assigneeId === currentUserId);
  }, []);
  
  const filteredTasks = useMemo(() => {
    if (activeTab === 'all') return userTasks;
    return userTasks.filter(task => {
      if (activeTab === 'overdue') {
        return task.status === 'overdue' || 
          (task.status !== 'completed' && new Date(task.deadline) < new Date());
      }
      return task.status === activeTab;
    });
  }, [userTasks, activeTab]);
  
  const statusCounts = useMemo(() => ({
    all: userTasks.length,
    todo: userTasks.filter(t => t.status === 'todo').length,
    in_progress: userTasks.filter(t => t.status === 'in_progress').length,
    completed: userTasks.filter(t => t.status === 'completed').length,
    overdue: userTasks.filter(t => 
      t.status === 'overdue' || 
      (t.status !== 'completed' && new Date(t.deadline) < new Date())
    ).length,
  }), [userTasks]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isOverdue = (task: ITask) => {
    if (task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <CheckSquareIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">我的任务</h1>
              <p className="text-sm text-muted-foreground">
                查看和管理您被分配的任务
                {statusCounts.overdue > 0 && (
                  <span className="text-destructive ml-2">
                    （{statusCounts.overdue} 个任务已逾期）
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 状态标签 */}
      <section className="w-full">
        <div className="flex flex-wrap items-center gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-accent text-accent-foreground hover:bg-accent/80'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${
                activeTab === tab.key ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                ({statusCounts[tab.key]})
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 任务列表 */}
      <section className="w-full space-y-4">
        {filteredTasks.map((task) => {
          const typedTask = task as ITask;
          const status = statusConfig[typedTask.status];
          const StatusIcon = status.icon;
          const priority = priorityConfig[typedTask.priority];
          const overdue = isOverdue(typedTask);

          return (
            <Card
              key={typedTask.id}
              className={`group transition-all hover:shadow-md ${
                overdue ? 'border-l-4 border-l-destructive' : ''
              }`}
            >
              <CardContent className="p-4">
                {/* 第一行：标题和状态 */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-foreground truncate">
                        {typedTask.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full bg-accent ${priority.color}`}>
                        {priority.label}优先级
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                      {typedTask.description}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${status.bgColor} ${status.color} border-0 shrink-0`}
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                {/* 第二行：截止日期和进度 */}
                <div className="flex items-center justify-between gap-4">
                  <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <CalendarIcon className="w-4 h-4" />
                    <span>截止 {formatDate(typedTask.deadline)}</span>
                    {overdue && <span className="font-medium">(已逾期)</span>}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8" asChild>
                    <Link to={`/tasks/${typedTask.id}`}>
                      <EyeIcon className="w-4 h-4 mr-1" />
                      详情
                    </Link>
                  </Button>
                </div>

                {/* 进度条 */}
                {typedTask.status !== 'completed' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>完成进度</span>
                      <span className={overdue ? 'text-destructive' : ''}>{typedTask.progress}%</span>
                    </div>
                    <Progress value={typedTask.progress} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <CheckSquareIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">暂无任务</p>
              <p className="text-sm text-muted-foreground mt-1">当前筛选条件下没有任务</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default MyTasks;
