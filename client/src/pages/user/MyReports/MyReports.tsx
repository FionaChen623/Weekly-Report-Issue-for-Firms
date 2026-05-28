import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileTextIcon,
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EditIcon,
  EyeIcon,
} from 'lucide-react';
import { reportList } from '@shared/static/mockData';
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
    icon: CheckCircleIcon,
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
    return { label: '待提交', color: 'text-muted-foreground', bgColor: 'bg-muted' };
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

const MyReports = () => {
  const navigate = useNavigate();
  const [reports] = useState<IReport[]>(reportList.filter(r => r.authorId === 'user-002' || r.status === 'draft') as IReport[]);

  const handleCreateReport = () => {
    navigate('/report/new');
  };

  const handleEditReport = (reportId: string) => {
    navigate(`/report/edit/${reportId}`);
  };

  const handleViewReport = (reportId: string) => {
    navigate(`/report/edit/${reportId}`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const currentWeekReport = reports.find(r => r.weekNumber === 21 && r.year === 2026);
  const hasSubmittedThisWeek = currentWeekReport && currentWeekReport.status !== 'draft';

  return (
    <div className="w-full space-y-6">
      {/* 页面标题和新建按钮 */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">我的周报</h1>
            <p className="text-sm text-muted-foreground mt-1">
              查看和管理您的周报记录
            </p>
          </div>
          {!hasSubmittedThisWeek && (
            <Button onClick={handleCreateReport} className="shrink-0">
              <PlusIcon className="size-4 mr-2" />
              写周报
            </Button>
          )}
        </div>
      </section>

      {/* 本周提交状态提示 */}
      <section className="w-full">
        <Card className={hasSubmittedThisWeek ? 'border-l-4 border-l-success' : 'border-l-4 border-l-warning'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${hasSubmittedThisWeek ? 'bg-success/10' : 'bg-warning/10'}`}>
                  {hasSubmittedThisWeek ? (
                    <CheckCircleIcon className="size-5 text-success" />
                  ) : (
                    <ClockIcon className="size-5 text-warning" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {hasSubmittedThisWeek ? '本周周报已提交' : '本周周报待提交'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {hasSubmittedThisWeek 
                      ? `提交于 ${currentWeekReport?.submittedAt ? formatDate(currentWeekReport.submittedAt) : '-'}` 
                      : '截止日期：本周五 18:00'}
                  </p>
                </div>
              </div>
              {!hasSubmittedThisWeek && (
                <Button size="sm" onClick={handleCreateReport}>
                  立即填写
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 周报列表 */}
      <section className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">历史周报</h2>
        </div>

        {reports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <FileTextIcon className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">暂无周报记录</p>
              <Button variant="outline" className="mt-4" onClick={handleCreateReport}>
                写第一份周报
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const status = statusConfig[report.status];
              const StatusIcon = status.icon;
              const submissionType = getSubmissionType(report);
              const isDraft = report.status === 'draft';

              return (
                <Card
                  key={report.id}
                  className="group cursor-pointer transition-all hover:shadow-md overflow-hidden"
                >
                  {/* 顶部状态条 */}
                  <div
                    className={`h-1 w-full ${
                      report.status === 'draft'
                        ? 'bg-muted'
                        : report.status === 'submitted'
                        ? 'bg-warning'
                        : report.status === 'reviewed'
                        ? 'bg-success'
                        : 'bg-destructive'
                    }`}
                  />
                  
                  <CardContent className="p-4">
                    {/* 第一行：周次 + 状态 */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {report.year}年 第{report.weekNumber}周周报
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <CalendarIcon className="size-3" />
                          <span>
                            {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {report.status !== 'draft' && (
                          <Badge
                            variant="secondary"
                            className={`${submissionType.bgColor} ${submissionType.color} border-0 text-xs`}
                          >
                            {submissionType.label}
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={`${status.bgColor} ${status.color} border-0 gap-1 text-xs`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>
                    </div>

                    {/* 第二行：内容摘要 */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-foreground line-clamp-1">
                        <span className="text-muted-foreground">本周：</span>
                        {report.content.summary}
                      </p>
                      <p className="text-sm text-foreground line-clamp-1">
                        <span className="text-muted-foreground">下周：</span>
                        {report.content.plan}
                      </p>
                    </div>

                    {/* 第三行：操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {report.reviewedByName && (
                          <span>审核人：{report.reviewedByName}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isDraft ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEditReport(report.id)}
                            className="h-8"
                          >
                            <EditIcon className="w-3.5 h-3.5 mr-1" />
                            继续编辑
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReport(report.id)}
                            className="h-8"
                          >
                            <EyeIcon className="w-3.5 h-3.5 mr-1" />
                            查看详情
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 审核意见提示 */}
                    {report.status === 'needs_revision' && report.reviewComments && (
                      <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <p className="text-xs text-destructive font-medium mb-1">修改建议</p>
                        <p className="text-xs text-muted-foreground">{report.reviewComments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyReports;
