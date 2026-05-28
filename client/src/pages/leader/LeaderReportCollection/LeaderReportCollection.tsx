import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { FileTextIcon, SearchIcon, EyeIcon, CheckCircleIcon, XCircleIcon, CalendarIcon, UserIcon, AlertCircleIcon } from 'lucide-react';
import { reportList, groupMembers, teamMembers } from '@shared/static/mockData';
import type { IReport, ReportStatus } from '@/types';
import { logger } from '@lark-apaas/client-toolkit/logger';

// 当前组长所属组（模拟）
const CURRENT_GROUP_ID = 'group-001';
const CURRENT_LEADER_ID = 'user-002';

// 获取组成员ID列表
const getGroupMemberIds = () => {
  return groupMembers
    .filter(gm => gm.groupId === CURRENT_GROUP_ID)
    .map(gm => gm.userId);
};

// 状态标签配置
const statusConfig: Record<ReportStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ElementType }> = {
  draft: { label: '草稿', variant: 'secondary', icon: FileTextIcon },
  submitted: { label: '待审核', variant: 'outline', icon: AlertCircleIcon },
  reviewed: { label: '已审核', variant: 'default', icon: CheckCircleIcon },
  needs_revision: { label: '需修改', variant: 'destructive', icon: XCircleIcon },
};

// 周报统计卡片
function ReportStatsCard({ title, value, icon: Icon, colorClass }: { title: string; value: number; icon: React.ElementType; colorClass: string }) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// 周报列表项
function ReportListItem({ report, onView, onReview }: { report: IReport; onView: (r: IReport) => void; onReview: (r: IReport) => void }) {
  const status = statusConfig[report.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`mt-1 p-2 rounded-md ${report.status === 'submitted' ? 'bg-primary/10' : 'bg-muted'}`}>
          <FileTextIcon className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium truncate">第{report.weekNumber}周周报</h4>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="size-3" />
              {status.label}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <UserIcon className="size-3" />
              {report.authorName}
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3" />
              {report.periodStart} ~ {report.periodEnd}
            </span>
            {report.submittedAt && (
              <span>提交于 {new Date(report.submittedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{report.content.summary}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <Button variant="ghost" size="sm" onClick={() => onView(report)}>
          <EyeIcon className="size-4 mr-1" />
          查看
        </Button>
        {report.status === 'submitted' && (
          <Button variant="outline" size="sm" onClick={() => onReview(report)}>
            <CheckCircleIcon className="size-4 mr-1" />
            审核
          </Button>
        )}
      </div>
    </div>
  );
}

const LeaderReportCollection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<IReport | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  // 获取组成员的周报
  const groupMemberIds = useMemo(() => getGroupMemberIds(), []);
  const groupReports = useMemo(() => {
    return reportList.filter(report => groupMemberIds.includes(report.authorId));
  }, [groupMemberIds]);

  // 过滤和搜索
  const filteredReports = useMemo(() => {
    return groupReports.filter(report => {
      const matchesSearch = searchQuery === '' || 
        report.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.content.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [groupReports, searchQuery, statusFilter]);

  // 统计
  const stats = useMemo(() => {
    const total = groupReports.length;
    const pending = groupReports.filter(r => r.status === 'submitted').length;
    const reviewed = groupReports.filter(r => r.status === 'reviewed').length;
    const needsRevision = groupReports.filter(r => r.status === 'needs_revision').length;
    return { total, pending, reviewed, needsRevision };
  }, [groupReports]);

  // 处理查看
  const handleView = (report: IReport) => {
    setSelectedReport(report);
  };

  // 处理审核
  const handleReview = (report: IReport) => {
    setSelectedReport(report);
    setIsReviewDialogOpen(true);
    setReviewComment('');
    setReviewAction('approve');
  };

  // 提交审核
  const submitReview = () => {
    // 实际项目中这里会调用API
    logger.info('审核提交:', String({
      reportId: selectedReport?.id,
      action: reviewAction,
      comment: reviewComment,
    }));
    setIsReviewDialogOpen(false);
    setSelectedReport(null);
    // 这里应该刷新列表
  };

  // 关闭详情弹窗
  const closeDetail = () => {
    setSelectedReport(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">组周报收集</h1>
            <p className="text-muted-foreground mt-1">查看和审核组内成员的周报提交情况</p>
          </div>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportStatsCard 
          title="组内周报总数" 
          value={stats.total} 
          icon={FileTextIcon} 
          colorClass="bg-primary/10 text-primary" 
        />
        <ReportStatsCard 
          title="待审核" 
          value={stats.pending} 
          icon={AlertCircleIcon} 
          colorClass="bg-warning-bg text-warning" 
        />
        <ReportStatsCard 
          title="已审核" 
          value={stats.reviewed} 
          icon={CheckCircleIcon} 
          colorClass="bg-success-bg text-success" 
        />
        <ReportStatsCard 
          title="需修改" 
          value={stats.needsRevision} 
          icon={XCircleIcon} 
          colorClass="bg-danger-bg text-danger" 
        />
      </section>

      {/* 筛选栏 */}
      <section className="w-full flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="搜索成员姓名或周报内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
            <SelectItem value="submitted">待审核</SelectItem>
            <SelectItem value="reviewed">已审核</SelectItem>
            <SelectItem value="needs_revision">需修改</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* 周报列表 */}
      <section className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">组内周报列表</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredReports.length > 0 ? (
              <div className="divide-y divide-border">
                {filteredReports.map((report) => (
                  <ReportListItem 
                    key={report.id} 
                    report={report as IReport} 
                    onView={handleView}
                    onReview={handleReview}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>暂无周报</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || statusFilter !== 'all' 
                        ? '没有符合筛选条件的周报' 
                        : '组内成员暂未完成周报提交'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 周报详情弹窗 */}
      <Dialog open={!!selectedReport && !isReviewDialogOpen} onOpenChange={closeDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  第{selectedReport.weekNumber}周周报
                  <Badge variant={statusConfig[selectedReport.status].variant}>
                    {statusConfig[selectedReport.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserIcon className="size-4" />
                    {selectedReport.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="size-4" />
                    {selectedReport.periodStart} ~ {selectedReport.periodEnd}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">本周工作总结</h4>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedReport.content.summary}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">下周工作计划</h4>
                  <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                    {selectedReport.content.plan}
                  </div>
                </div>
                
                {selectedReport.content.issues && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">遇到的问题</h4>
                    <div className="p-3 bg-danger-bg rounded-md text-sm whitespace-pre-wrap text-danger">
                      {selectedReport.content.issues}
                    </div>
                  </div>
                )}

                {selectedReport.reviewComments && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">审核意见</h4>
                    <div className="p-3 bg-primary/5 rounded-md text-sm">
                      <p className="text-muted-foreground">审核人: {selectedReport.reviewedByName}</p>
                      <p className="mt-1">{selectedReport.reviewComments}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={closeDetail}>关闭</Button>
                {selectedReport.status === 'submitted' && (
                  <Button onClick={() => setIsReviewDialogOpen(true)}>去审核</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 审核弹窗 */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>审核周报</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedReport && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{selectedReport.authorName} - 第{selectedReport.weekNumber}周周报</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedReport.content.summary}</p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button
                variant={reviewAction === 'approve' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setReviewAction('approve')}
              >
                <CheckCircleIcon className="size-4" />
                通过
              </Button>
              <Button
                variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setReviewAction('reject')}
              >
                <XCircleIcon className="size-4" />
                需修改
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {reviewAction === 'approve' ? '审核意见（可选）' : '修改建议（必填）'}
              </label>
              <Textarea
                placeholder={reviewAction === 'approve' ? '输入审核意见...' : '请输入需要修改的内容...'}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>取消</Button>
            <Button onClick={submitReview} disabled={reviewAction === 'reject' && !reviewComment.trim()}>
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderReportCollection;
