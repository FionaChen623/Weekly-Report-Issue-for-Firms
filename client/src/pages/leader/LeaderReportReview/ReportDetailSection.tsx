import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FileTextIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  CheckSquareIcon,
  UserIcon,
  SendIcon,
} from 'lucide-react';
import { taskList } from '@shared/static/mockData';
import type { IReport, ReportStatus } from '@/types';

const statusConfig: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: typeof FileTextIcon }> = {
  draft: {
    label: '草稿',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: FileTextIcon,
  },
  submitted: {
    label: '已提交',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: ClockIcon,
  },
  reviewed: {
    label: '已审核',
    color: 'text-success',
    bgColor: 'bg-success/10',
    icon: CheckCircleIcon,
  },
  needs_revision: {
    label: '需修改',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    icon: AlertCircleIcon,
  },
};

const getSubmissionType = (report: IReport): { label: string; color: string; bgColor: string } => {
  if (report.status === 'draft') {
    return { label: '未提交', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  }

  if (report.status === 'needs_revision') {
    return { label: '逾期提交', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  }

  if (report.submittedAt && report.periodEnd) {
    const submittedDate = new Date(report.submittedAt);
    const periodEndDate = new Date(report.periodEnd);
    periodEndDate.setHours(23, 59, 59, 999);

    if (submittedDate > periodEndDate) {
      return { label: '逾期提交', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    }
  }

  return { label: '按时提交', color: 'text-success', bgColor: 'bg-success/10' };
};

interface IReportDetailSectionProps {
  report: IReport;
  onSubmitReview: (data: { action: 'approve' | 'reject'; comment: string }) => void;
}

export default function ReportDetailSection({ report, onSubmitReview }: IReportDetailSectionProps) {
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  const status = statusConfig[report.status];
  const StatusIcon = status.icon;
  const submissionType = getSubmissionType(report);
  const relatedTasks = taskList.filter((t) => report.relatedTaskIds?.includes(t.id));

  const getInitials = (name: string) => name.slice(0, 2);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = () => {
    onSubmitReview({ action: reviewAction, comment: reviewComment });
  };

  const isPendingReview = report.status === 'submitted' && !report.leaderReviewed;

  return (
    <section className="w-full space-y-6">
      {/* 周报信息卡片 */}
      <Card className="border-t-4" style={{ borderTopColor: report.status === 'reviewed' ? 'hsl(142 71% 45%)' : report.status === 'needs_revision' ? 'hsl(0 72% 51%)' : report.status === 'submitted' ? 'hsl(38 92% 50%)' : 'hsl(222 12% 45%)' }}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarFallback className="text-sm bg-primary/10 text-primary">
                  {getInitials(report.authorName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {report.year}年 第{report.weekNumber}周周报
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{report.authorName}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className={`${status.bgColor} ${status.color} border-0 gap-1`}>
                <StatusIcon className="size-3.5" />
                {status.label}
              </Badge>
              {report.status !== 'draft' && (
                <Badge variant="secondary" className={`${submissionType.bgColor} ${submissionType.color} border-0 text-xs`}>
                  {submissionType.label}
                </Badge>
              )}
              {report.leaderReviewed && (
                <Badge variant="secondary" className="bg-success/10 text-success border-0 text-xs">
                  <CheckCircleIcon className="size-3 mr-1" />
                  组长已通过
                </Badge>
              )}
            </div>
          </div>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="size-4" />
              <span>
                {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
              </span>
            </div>
            {report.submittedAt && (
              <div className="flex items-center gap-1.5">
                <ClockIcon className="size-4" />
                <span>提交于 {formatDateTime(report.submittedAt)}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 本周工作总结 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <CheckSquareIcon className="size-4 text-primary" />
              <h3 className="font-medium">本周工作总结</h3>
            </div>
            <div className="pl-6">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {report.content.summary}
              </p>
            </div>
          </div>

          {/* 下周工作计划 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground">
              <CalendarIcon className="size-4 text-primary" />
              <h3 className="font-medium">下周工作计划</h3>
            </div>
            <div className="pl-6">
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {report.content.plan}
              </p>
            </div>
          </div>

          {/* 遇到的问题 */}
          {report.content.issues && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground">
                <AlertCircleIcon className="size-4 text-warning" />
                <h3 className="font-medium">遇到的问题</h3>
              </div>
              <div className="pl-6">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {report.content.issues}
                </p>
              </div>
            </div>
          )}

          {/* 关联任务 */}
          {relatedTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-foreground">
                <CheckSquareIcon className="size-4 text-success" />
                <h3 className="font-medium">关联任务</h3>
              </div>
              <div className="pl-6 space-y-2">
                {relatedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-success'
                            : task.status === 'overdue'
                              ? 'bg-destructive'
                              : task.status === 'in_progress'
                                ? 'bg-primary'
                                : 'bg-muted-foreground'
                        }`}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.progress}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 组长审核信息 */}
      {report.leaderReviewed && report.leaderReviewedBy && (
        <Card className="border-l-4 border-l-success">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircleIcon className="size-5 text-success" />
              组长审核信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">审核人：</span>
              <span className="font-medium">{report.leaderReviewedByName}</span>
            </div>
            {report.leaderReviewedAt && (
              <div className="flex items-center gap-2 text-sm">
                <ClockIcon className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">审核时间：</span>
                <span className="font-medium">{formatDateTime(report.leaderReviewedAt)}</span>
              </div>
            )}
            {report.leaderReviewComments && (
              <div className="p-4 rounded-lg bg-success/10">
                <div className="flex items-start gap-2">
                  <MessageSquareIcon className="size-4 text-success mt-0.5" />
                  <p className="text-sm text-foreground">{report.leaderReviewComments}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 管理员审核信息（如果存在） */}
      {report.status === 'reviewed' && report.reviewedBy && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircleIcon className="size-5 text-primary" />
              管理员审核信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <UserIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">审核人：</span>
              <span className="font-medium">{report.reviewedByName}</span>
            </div>
            {report.reviewComments && (
              <div className="p-4 rounded-lg bg-primary/10">
                <div className="flex items-start gap-2">
                  <MessageSquareIcon className="size-4 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">{report.reviewComments}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {report.status === 'needs_revision' && report.reviewComments && (
        <Card className="border-l-4 border-l-destructive">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircleIcon className="size-5 text-destructive" />
              修改意见
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm mb-3">
              <UserIcon className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">审核人：</span>
              <span className="font-medium">{report.reviewedByName}</span>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10">
              <div className="flex items-start gap-2">
                <MessageSquareIcon className="size-4 text-destructive mt-0.5" />
                <p className="text-sm text-foreground">{report.reviewComments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 审核操作区 */}
      {isPendingReview && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircleIcon className="size-5 text-primary" />
              组长审核
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={reviewAction}
              onValueChange={(value) => setReviewAction(value as 'approve' | 'reject')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircleIcon className="size-4 text-success" />
                  通过周报
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer">
                  <AlertCircleIcon className="size-4 text-destructive" />
                  打回报表
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="comment">审核意见（可选）</Label>
              <Textarea
                id="comment"
                placeholder={reviewAction === 'approve' ? '可填写鼓励或建议...' : '请说明需要修改的内容...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewComment('')}>
                清空
              </Button>
              <Button onClick={handleSubmit} className="gap-2">
                <SendIcon className="size-4" />
                提交审核
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
