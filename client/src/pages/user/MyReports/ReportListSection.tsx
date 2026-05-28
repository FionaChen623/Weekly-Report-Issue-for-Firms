import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileTextIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  EditIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { reportList } from '@shared/static/mockData';
import type { IReport, ReportStatus } from '@/types';

const statusConfig: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: typeof FileTextIcon }> = {
  draft: {
    label: '草稿',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    icon: EditIcon,
  },
  submitted: {
    label: '已提交',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    icon: ClockIcon,
  },
  reviewed: {
    label: '已审阅',
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

const isOverdue = (report: IReport) => {
  if (report.status === 'draft') {
    const periodEnd = new Date(report.periodEnd);
    const now = new Date();
    return periodEnd < now;
  }
  return false;
};

const ReportListSection = () => {
  // 断言 mock 数据符合 IReport 类型，解决 status 字段 string 与 ReportStatus 不匹配问题
  const typedReportList = reportList as IReport[];
  const sortedReports = [...typedReportList].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.weekNumber - a.weekNumber;
  });

  const getReportStatus = (report: IReport) => {
    if (isOverdue(report)) {
      return { ...statusConfig.draft, label: '已逾期', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    }
    return statusConfig[report.status];
  };

  return (
    <section className="w-full space-y-4">
      {sortedReports.map((report) => {
        const status = getReportStatus(report);
        const StatusIcon = status.icon;

        return (
          <Card key={report.id} className="group overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex">
                {/* 顶部状态条 */}
                <div className={`w-1 ${status.bgColor.replace('/10', '')}`} />
                <div className="flex-1 p-4">
                  {/* 第一行：周次标题 + 状态 */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-foreground">
                          第 {report.weekNumber} 周周报
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          ({report.year}年)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {report.periodStart} ~ {report.periodEnd}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${status.bgColor} ${status.color} border-0 shrink-0 gap-1`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* 内容摘要 */}
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.content.summary || '暂无内容摘要'}
                    </p>
                  </div>

                  {/* 底部信息行 */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {report.submittedAt && (
                        <span>提交于 {new Date(report.submittedAt).toLocaleDateString('zh-CN')}</span>
                      )}
                      {report.reviewedByName && (
                        <span>审阅人: {report.reviewedByName}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 group-hover:bg-accent"
                      asChild
                    >
                      <Link to={report.status === 'draft' ? `/report/edit/${report.id}` : `/report/${report.id}`}>
                        <span className="text-sm">
                          {report.status === 'draft' ? '继续编辑' : '查看详情'}
                        </span>
                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {sortedReports.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
                <FileTextIcon className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">暂无周报记录</p>
              <p className="text-xs text-muted-foreground mt-1">点击上方按钮创建新周报</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default ReportListSection;
