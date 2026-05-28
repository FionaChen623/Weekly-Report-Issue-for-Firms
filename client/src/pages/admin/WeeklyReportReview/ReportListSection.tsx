import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { reportList, teamMembers, groupList } from '@shared/static/mockData';
import type { IReport, ReportStatus, ITeamMember } from '@/types';

// 类型断言：确保 mock 数据符合 IReport 类型定义
const typedReportList = reportList as IReport[];
const typedTeamMembers = teamMembers as ITeamMember[];

interface IReportListSectionProps {
  statusFilter?: string;
  weekFilter?: string;
  searchQuery?: string;
}

// 判断用户是否是组长
const isLeader = (userId: string): boolean => {
  return groupList.some((g) => g.leaderId === userId);
};

// 获取周报显示状态
// 组员：组长审核通过即显示"已审核"
// 组长：直接提交给管理员审核，管理员审核通过才显示"已审核"
const getReportDisplayStatus = (report: IReport): { label: string; color: string; bgColor: string; icon: typeof FileTextIcon } => {
  if (report.status === 'draft') {
    return { label: '草稿', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: FileTextIcon };
  }
  if (report.status === 'needs_revision') {
    return { label: '需修改', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: AlertCircleIcon };
  }
  // 组长：直接待管理员审核，不需要自审
  if (isLeader(report.authorId)) {
    if (report.status === 'reviewed') {
      return { label: '已审核', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircleIcon };
    }
    return { label: '待管理员审核', color: 'text-primary', bgColor: 'bg-primary/10', icon: ClockIcon };
  }
  // 组员：组长审核通过即已审核
  if (report.leaderReviewed) {
    return { label: '已审核', color: 'text-success', bgColor: 'bg-success/10', icon: CheckCircleIcon };
  }
  return { label: '待审核', color: 'text-warning', bgColor: 'bg-warning/10', icon: ClockIcon };
};

const getSubmissionType = (report: IReport): { label: string; color: string; bgColor: string } => {
  if (report.status === 'draft') {
    return { label: '未提交', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  }
  
  if (report.status === 'needs_revision') {
    return { label: '逾期提交', color: 'text-destructive', bgColor: 'bg-destructive/10' };
  }
  
  // 检查是否逾期提交（根据 submittedAt 和 periodEnd 判断）
  if (report.submittedAt && report.periodEnd) {
    const submittedDate = new Date(report.submittedAt);
    const periodEndDate = new Date(report.periodEnd);
    // 设置 periodEnd 为当天结束时间
    periodEndDate.setHours(23, 59, 59, 999);
    
    if (submittedDate > periodEndDate) {
      return { label: '逾期提交', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    }
  }
  
  return { label: '按时提交', color: 'text-success', bgColor: 'bg-success/10' };
};

export default function ReportListSection({ 
  statusFilter = 'all', 
  weekFilter = '', 
  searchQuery = '' 
}: IReportListSectionProps) {
  const navigate = useNavigate();
  
  // 根据筛选条件过滤周报
  const filteredReports = useMemo(() => {
    return typedReportList.filter((report) => {
      const authorIsLeader = isLeader(report.authorId);
      
      // 状态筛选
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_leader') {
          // 待组长审核（组员）：组员的周报已提交但组长未审核
          if (authorIsLeader || report.status !== 'submitted' || report.leaderReviewed) return false;
        } else if (statusFilter === 'pending_admin') {
          // 待管理员审核（组长）：组长的周报已提交但未终审
          if (!authorIsLeader || report.status !== 'submitted') return false;
        } else if (statusFilter === 'reviewed') {
          // 已审核：组员（组长已审）或 组长（管理员已审）
          if (authorIsLeader) {
            if (report.status !== 'reviewed') return false;
          } else {
            if (!report.leaderReviewed) return false;
          }
        } else if (statusFilter === 'needs_revision') {
          if (report.status !== 'needs_revision') return false;
        } else if (statusFilter === 'draft') {
          if (report.status !== 'draft') return false;
        }
      }

      // 周次筛选
      if (weekFilter && report.weekNumber !== parseInt(weekFilter)) {
        return false;
      }

      // 搜索筛选
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return report.authorName.toLowerCase().includes(query);
      }

      return true;
    });
  }, [statusFilter, weekFilter, searchQuery]);

  const handleViewDetail = (reportId: string) => {
    navigate(`/admin/reports/${reportId}`);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <section className="w-full space-y-4">
      {filteredReports.map((report) => {
        const displayStatus = getReportDisplayStatus(report);
        const StatusIcon = displayStatus.icon;
        const submissionType = getSubmissionType(report);

        return (
          <Card
            key={report.id}
            className="group cursor-pointer transition-all hover:shadow-md overflow-hidden"
            onClick={() => handleViewDetail(report.id)}
          >
            {/* 顶部状态条 - 根据多级审核状态显示不同颜色 */}
            <div
              className={`h-1 w-full ${
                report.status === 'draft'
                  ? 'bg-muted'
                  : report.status === 'reviewed'
                  ? 'bg-success'
                  : report.status === 'needs_revision'
                  ? 'bg-destructive'
                  : report.leaderReviewed
                  ? 'bg-primary'
                  : 'bg-warning'
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
                    className={`${displayStatus.bgColor} ${displayStatus.color} border-0 gap-1 text-xs`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {displayStatus.label}
                  </Badge>
                  {report.leaderReviewed && (
                    <Badge
                      variant="secondary"
                      className="bg-success/10 text-success border-0 text-xs"
                    >
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      组长已审
                    </Badge>
                  )}
                </div>
              </div>

              {/* 第二行：时间段 */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>
                  {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                </span>
                {report.submittedAt && (
                  <>
                    <span className="mx-1">·</span>
                    <ClockIcon className="w-3.5 h-3.5" />
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

              {/* 第四行：关联任务 + 审核信息 + 操作 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {report.relatedTaskIds && report.relatedTaskIds.length > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>关联 {report.relatedTaskIds.length} 个任务</span>
                    </div>
                  )}
                  {report.leaderReviewComments && (
                    <div className="flex items-center gap-1 text-primary">
                      <MessageSquareIcon className="w-3.5 h-3.5" />
                      <span>组长意见: {report.leaderReviewedByName}</span>
                    </div>
                  )}
                  {report.reviewComments && (
                    <div className="flex items-center gap-1 text-success">
                      <MessageSquareIcon className="w-3.5 h-3.5" />
                      <span>管理员意见</span>
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
                  <EyeIcon className="w-4 h-4 mr-1" />
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filteredReports.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <FileTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无周报</p>
              <p className="text-sm mt-1">等待团队成员提交周报</p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
