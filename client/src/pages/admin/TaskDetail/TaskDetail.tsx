import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, BellIcon } from 'lucide-react';
import TaskInfoSection from './TaskInfoSection';
import TimelineSection from './TimelineSection';
import { taskList } from '@shared/static/mockData';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { ITask } from '@/types';

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  // 断言 task 为 ITask 类型以解决 mock 数据与接口定义的类型不匹配问题
  const task = taskList.find((t) => t.id === id) as ITask | undefined;

  if (!task) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">任务不存在</h2>
          <p className="text-muted-foreground">该任务可能已被删除或您没有访问权限</p>
          <Button asChild variant="outline">
            <Link to="/admin/tasks">
              <ArrowLeftIcon className="size-4 mr-2" />
              返回任务列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSendReminder = () => {
    logger.info('发送提醒:', String(task.id));
  };

  return (
    <div className="w-full space-y-6">
      <section className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/tasks">
              <ArrowLeftIcon className="size-4 mr-2" />
              返回
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">任务详情</h1>
        </div>
        <div className="flex items-center gap-2">
          {task.status === 'overdue' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSendReminder}
            >
              <BellIcon className="size-4 mr-2" />
              发送提醒
            </Button>
          )}
          <Button variant="outline" size="sm">
            编辑任务
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TaskInfoSection task={task} />
        </div>
        <div className="space-y-6">
          <TimelineSection />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
