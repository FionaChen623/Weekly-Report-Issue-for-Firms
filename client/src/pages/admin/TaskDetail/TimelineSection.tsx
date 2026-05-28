import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClockIcon, CheckCircleIcon, AlertCircleIcon, CircleIcon, PlayCircleIcon } from 'lucide-react';
import { taskHistoryList } from '@shared/static/mockData';
import type { ITaskHistory } from '@/types';

const getStatusIcon = (action: string, oldValue?: string, newValue?: string) => {
  if (action === '创建任务') {
    return <CircleIcon className="size-3.5 text-muted-foreground" />;
  }
  if (action === '状态变更') {
    if (newValue === 'completed') {
      return <CheckCircleIcon className="size-3.5 text-success" />;
    }
    if (newValue === 'overdue') {
      return <AlertCircleIcon className="size-3.5 text-destructive" />;
    }
    if (newValue === 'in_progress') {
      return <PlayCircleIcon className="size-3.5 text-primary" />;
    }
  }
  if (action === '进度更新') {
    return <ClockIcon className="size-3.5 text-info" />;
  }
  return <CircleIcon className="size-3.5 text-muted-foreground" />;
};

const getStatusDotColor = (action: string, oldValue?: string, newValue?: string) => {
  if (action === '创建任务') {
    return 'bg-muted-foreground';
  }
  if (action === '状态变更') {
    if (newValue === 'completed') {
      return 'bg-success';
    }
    if (newValue === 'overdue') {
      return 'bg-destructive';
    }
    if (newValue === 'in_progress') {
      return 'bg-primary';
    }
    if (newValue === 'todo') {
      return 'bg-muted-foreground';
    }
  }
  if (action === '进度更新') {
    return 'bg-info';
  }
  return 'bg-muted-foreground';
};

const getStatusDescription = (item: ITaskHistory) => {
  if (item.action === '创建任务') {
    return '创建了任务';
  }
  if (item.action === '状态变更') {
    const statusMap: Record<string, string> = {
      todo: '未开始',
      in_progress: '进行中',
      completed: '已完成',
      overdue: '已逾期',
    };
    return `状态变更为 ${statusMap[item.newValue || ''] || item.newValue}`;
  }
  if (item.action === '进度更新') {
    return `进度从 ${item.oldValue} 更新至 ${item.newValue}`;
  }
  return item.action;
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    time: date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
};

const TimelineSection: React.FC = () => {
  const sortedHistory = [...taskHistoryList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <section className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">任务进度时间轴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-4">
            <div className="absolute left-[1.1875rem] top-2 bottom-2 w-px bg-border" />
            <div className="space-y-6">
              {sortedHistory.map((item, index) => {
                const { date, time } = formatDateTime(item.createdAt);
                const dotColor = getStatusDotColor(item.action, item.oldValue, item.newValue);
                const isLast = index === sortedHistory.length - 1;

                return (
                  <div key={item.id} className="relative flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`z-10 size-2.5 rounded-full ${dotColor} ring-4 ring-background`}
                      />
                      {!isLast && <div className="flex-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.action, item.oldValue, item.newValue)}
                          <span className="text-sm font-medium text-foreground">
                            {getStatusDescription(item)}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{date}</div>
                          <div className="text-xs text-muted-foreground">{time}</div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        操作人: {item.operatorName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default TimelineSection;
