import { Link } from 'react-router-dom';
import { AlertCircleIcon, ChevronRightIcon, ClockIcon, UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ITask } from '@/types';
import { taskList } from '@shared/static/mockData';

const getStatusConfig = (status: ITask['status']) => {
  const configs = {
    todo: { label: '未开始', variant: 'secondary' as const, color: 'text-muted-foreground' },
    in_progress: { label: '进行中', variant: 'default' as const, color: 'text-primary' },
    completed: { label: '已完成', variant: 'default' as const, color: 'text-success' },
    overdue: { label: '已逾期', variant: 'destructive' as const, color: 'text-destructive' },
  };
  return configs[status];
};

const getPriorityConfig = (priority: ITask['priority']) => {
  const configs = {
    low: { label: '低', variant: 'secondary' as const },
    medium: { label: '中', variant: 'default' as const },
    high: { label: '高', variant: 'destructive' as const },
  };
  return configs[priority];
};

const RecentTasksSection = () => {
  const overdueTasks = taskList.filter((task) => task.status === 'overdue').slice(0, 5);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <AlertCircleIcon className="size-5 text-destructive" />
          <CardTitle className="text-lg font-semibold">逾期任务提醒</CardTitle>
        </div>
        <Badge variant="destructive" className="px-2 py-0.5">
          {overdueTasks.length} 个逾期
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        {overdueTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10 mb-3">
              <ClockIcon className="size-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">暂无逾期任务</p>
          </div>
        ) : (
          <div className="space-y-3">
            {overdueTasks.map((task) => {
              const statusConfig = getStatusConfig(task.status as ITask['status']);
              const priorityConfig = getPriorityConfig(task.priority as ITask['priority']);

              return (
                <div
                  key={task.id}
                  className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <Badge variant={priorityConfig.variant} className="text-xs shrink-0">
                        {priorityConfig.label}优先级
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UserIcon className="size-3" />
                        <span>{task.assigneeName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        <span className="text-destructive font-medium">
                          截止: {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 h-8 px-2" asChild>
                    <Link to={`/admin/tasks/${task.id}`}>
                      <ChevronRightIcon className="size-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 pt-3 border-t border-border">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/admin/tasks">查看全部任务</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTasksSection;
