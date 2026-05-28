import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  FileTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CalendarIcon,
  MessageSquareIcon,
  CheckSquareIcon,
} from 'lucide-react';
import { reportList, groupMembers, currentUser, teamMembers } from '@shared/static/mockData';
import type { IReport, ReportStatus } from '@/types';

// 类型断言
const typedReportList = reportList as IReport[];

const statusConfig: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: typeof FileTextIcon }> = {
  draft: {
    label: '草稿',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: FileTextIcon,
  },
  submitted: {
    label: '待审核',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: ClockIcon,
  },
  reviewed: {
    label: '已通过',
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

export default function ReportListSection() {
  const navigate = useNavigate();

  // 获取当前用户所在组的成员
  const currentUserGroup = teamMembers.find(
    (m) => m.id === currentUser.id && m.role === 'leader'
  )?.groupId;

  // 筛选当前组长需要审核的周报（本组组员的已提交周报，且未组长审核）
  const memberIds = groupMembers
    .filter((gm) => gm.groupId === currentUserGroup)
    .map((gm) => gm.userId);

  const pendingReports = typedReportList.filter(
    (report) =>
      memberIds.includes(report.authorId) &&
      report.status === 'submitted' &&
      !report.leaderReviewed &&
      report.authorId !== currentUser.id // 组长自己的周报不在这里审核
  );

  const reviewedReports = typedReportList.filter(
    (report) =>
      memberIds.includes(report.authorId) &&
      (report.leaderReviewed || report.status === 'reviewed' || report.status === 'needs_revision')
  );

  const handleViewDetail = (reportId: string) => {
    navigate(`/leader/reports/${reportId}`);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <section className="w-full space-y-6">
      {/* 待审核区域 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ClockIcon className="size-5 text-warning" />
            待审核周报
            {pendingReports.length > 0 && (
              <Badge variant="secondary" className="bg-warning/10 text-warning">
                {pendingReports.length}
              </Badge>
            )}
          </h2>
        </div>

        {pendingReports.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/30">
            <CardContent className="p-8 text-center">
              <CheckCircleIcon className="size-12 mx-auto mb-4 text-success/50" />
              <p className="text-muted-foreground font-medium">暂无待审核周报</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                组员的周报提交后会显示在这里
              </p>
            </CardContent>
          </Card>
        ) : (
          pendingReports.map((report) => {
            const status = statusConfig[report.status];
            const StatusIcon = status.icon;
            const submissionType = getSubmissionType(report);

            return (
              <Card
                key={report.id}
                className="group cursor-pointer transition-all hover:shadow-md overflow-hidden border-l-4 border-l-warning"
                onClick={() => handleViewDetail(report.id)}
              >
                {/* 顶部状态条 */}
                <div className="h-1 w-full bg-warning" />

                <CardContent className="p-4">
                  {/* 第一行：周次 + 状态 */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(report.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {report.year}年 第{report.weekNumber}周周报
                        </h3>
                        <p className="text-xs text-muted-foreground">{report.authorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`${submissionType.bgColor} ${submissionType.color} border-0 text-xs`}
                      >
                        {submissionType.label}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`${status.bgColor} ${status.color} border-0 gap-1 text-xs`}
                      >
                        <StatusIcon className="size-3.5" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* 第二行：时间段 */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <CalendarIcon className="size-3.5" />
                    <span>
                      {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                    </span>
                    {report.submittedAt && (
                      <>
                        <span className="mx-1">·</span>
                        <ClockIcon className="size-3.5" />
                        <span>提交于 {formatDate(report.submittedAt)}</span>
                      </>
                    )}
                  </div>

                  {/* 第三行：内容摘要 */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">本周总结</p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {report.content.summary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">下周计划</p>
                      <p className="text-sm text-foreground line-clamp-1">
                        {report.content.plan}
                      </p>
                    </div>
                  </div>

                  {/* 第四行：关联任务 + 操作 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.relatedTaskIds && report.relatedTaskIds.length > 0 && (
                        <div className="flex items-center gap-1">
                          <CheckSquareIcon className="size-3.5" />
                          <span>关联 {report.relatedTaskIds.length} 个任务</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(report.id);
                      }}
                    >
                      <EyeIcon className="size-4 mr-1" />
                      审核周报
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 已审核区域 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircleIcon className="size-5 text-success" />
            已审核周报
          </h2>
        </div>

        {reviewedReports.length === 0 ? (
          <Card className="border-dashed border-border bg-muted/30">
            <CardContent className="p-8 text-center">
              <FileTextIcon className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">暂无已审核周报</p>
            </CardContent>
          </Card>
        ) : (
          reviewedReports.map((report) => {
            const status = statusConfig[report.status];
            const StatusIcon = status.icon;
            const submissionType = getSubmissionType(report);

            return (
              <Card
                key={report.id}
                className="group cursor-pointer transition-all hover:shadow-md overflow-hidden"
                onClick={() => handleViewDetail(report.id)}
              >
                {/* 顶部状态条 */}
                <div
                  className={`h-1 w-full ${
                    report.status === 'reviewed'
                      ? 'bg-success'
                      : report.status === 'needs_revision'
                        ? 'bg-destructive'
                        : 'bg-muted'
                  }`}
                />

                <CardContent className="p-4">
                  {/* 第一行：周次 + 状态 */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(report.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {report.year}年 第{report.weekNumber}周周报
                        </h3>
                        <p className="text-xs text-muted-foreground">{report.authorName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="secondary"
                        className={`${submissionType.bgColor} ${submissionType.color} border-0 text-xs`}
                      >
                        {submissionType.label}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className={`${status.bgColor} ${status.color} border-0 gap-1 text-xs`}
                      >
                        <StatusIcon className="size-3.5" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  {/* 第二行：时间段 */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <CalendarIcon className="size-3.5" />
                    <span>
                      {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                    </span>
                    {report.submittedAt && (
                      <>
                        <span className="mx-1">·</span>
                        <ClockIcon className="size-3.5" />
                        <span>提交于 {formatDate(report.submittedAt)}</span>
                      </>
                    )}
                  </div>

                  {/* 第三行：内容摘要 */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">本周总结</p>
                      <p className="text-sm text-foreground line-clamp-2">
                        {report.content.summary}
                      </p>
                    </div>
                  </div>

                  {/* 第四行：审核状态 + 操作 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.leaderReviewed && (
                        <div className="flex items-center gap-1">
                          <CheckCircleIcon className="size-3.5 text-success" />
                          <span className="text-success">组长已通过</span>
                        </div>
                      )}
                      {report.leaderReviewComments && (
                        <div className="flex items-center gap-1">
                          <MessageSquareIcon className="size-3.5" />
                          <span>有审核意见</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(report.id);
                      }}
                    >
                      <EyeIcon className="size-4 mr-1" />
                      查看详情
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </section>
  );
}
