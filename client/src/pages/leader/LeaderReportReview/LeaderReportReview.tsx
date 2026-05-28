import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, FilterIcon, EyeIcon, CheckCircleIcon, XCircleIcon, UserIcon, ClockIcon, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reportList, teamMembers, currentUser, groupMembers } from '@shared/static/mockData';
import type { IReport } from '@/types';

// 组长审核页面 - 审核组员的周报
const LeaderReportReview = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 获取当前组长所带领的组员ID列表
  const memberIds = useMemo(() => {
    const leaderGroup = groupMembers.filter(gm => gm.userId === currentUser.id);
    if (leaderGroup.length === 0) return [];
    const groupId = leaderGroup[0].groupId;
    return groupMembers
      .filter(gm => gm.groupId === groupId && gm.userId !== currentUser.id)
      .map(gm => gm.userId);
  }, []);

  // 筛选组员的周报
  const filteredReports = useMemo(() => {
    const memberReports = reportList.filter(
      (report) => memberIds.includes(report.authorId) || report.authorId === currentUser.id
    ) as IReport[];

    return memberReports.filter((report) => {
      // 状态筛选
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_leader') {
          // 待组长审核：已提交且未组长审核
          if (report.status !== 'submitted' || report.leaderReviewed) return false;
        } else if (statusFilter === 'pending_admin') {
          // 待管理员审核：已组长审核但未终审
          if (!report.leaderReviewed || report.status === 'reviewed') return false;
        } else if (statusFilter === 'reviewed') {
          if (report.status !== 'reviewed') return false;
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
  }, [memberIds, statusFilter, weekFilter, searchQuery]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setWeekFilter('');
    setSearchQuery('');
  };

  const handleViewDetail = (reportId: string) => {
    navigate(`/leader/reports/${reportId}`);
  };

  const hasActiveFilters = statusFilter !== 'all' || weekFilter || searchQuery;

  const getInitials = (name: string) => name.slice(0, 2);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getStatusBadge = (report: IReport) => {
    if (report.status === 'draft') {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0 text-xs">
          草稿
        </Badge>
      );
    }
    if (report.status === 'needs_revision') {
      return (
        <Badge variant="secondary" className="bg-danger-bg text-danger border-0 text-xs">
          需修改
        </Badge>
      );
    }
    if (report.status === 'reviewed') {
      return (
        <Badge variant="secondary" className="bg-success-bg text-success border-0 text-xs">
          已审核
        </Badge>
      );
    }
    if (report.leaderReviewed) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs">
          待管理员审核
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-warning-bg text-warning border-0 text-xs">
        待审核
      </Badge>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">组员周报</h1>
            <p className="text-sm text-muted-foreground mt-1">
              审核您所带领的小组成员提交的周报
            </p>
          </div>
        </div>
      </section>

      {/* 筛选器区域 */}
      <section className="w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FilterIcon className="size-4" />
              <span>筛选</span>
            </div>

            {/* 状态筛选 */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="审核状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending_leader">待我审核</SelectItem>
                <SelectItem value="pending_admin">待管理员审核</SelectItem>
                <SelectItem value="reviewed">已审核</SelectItem>
                <SelectItem value="needs_revision">需修改</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>

            {/* 周次筛选 */}
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="周次" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部周次</SelectItem>
                <SelectItem value="21">第21周</SelectItem>
                <SelectItem value="20">第20周</SelectItem>
                <SelectItem value="19">第19周</SelectItem>
                <SelectItem value="18">第18周</SelectItem>
              </SelectContent>
            </Select>

            {/* 搜索 */}
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <Input
                type="search"
                placeholder="搜索成员姓名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>

            {/* 重置按钮 */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
              >
                重置
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 统计信息 */}
      <section className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-foreground">
                {reportList.filter((r) => memberIds.includes(r.authorId) && r.status === 'submitted' && !r.leaderReviewed).length}
              </div>
              <div className="text-xs text-muted-foreground">待我审核</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {reportList.filter((r) => memberIds.includes(r.authorId) && r.leaderReviewed && r.status === 'submitted').length}
              </div>
              <div className="text-xs text-muted-foreground">待管理员审核</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">
                {reportList.filter((r) => memberIds.includes(r.authorId) && r.status === 'reviewed').length}
              </div>
              <div className="text-xs text-muted-foreground">已通过</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-danger">
                {reportList.filter((r) => memberIds.includes(r.authorId) && r.status === 'needs_revision').length}
              </div>
              <div className="text-xs text-muted-foreground">需修改</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 周报列表 */}
      <section className="w-full space-y-4">
        {filteredReports.map((report) => (
          <Card
            key={report.id}
            className="group cursor-pointer transition-all hover:shadow-md overflow-hidden"
            onClick={() => handleViewDetail(report.id)}
          >
            {/* 顶部状态条 */}
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
                  {getStatusBadge(report)}
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

              {/* 第四行：审核意见 + 操作 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {report.leaderReviewComments && (
                    <div className="flex items-center gap-1 text-primary">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>组长已批注</span>
                    </div>
                  )}
                  {report.reviewComments && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span>管理员已审阅</span>
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
        ))}

        {filteredReports.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <FileTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无周报</p>
                <p className="text-sm mt-1">
                  {hasActiveFilters ? '尝试调整筛选条件' : '等待小组成员提交周报'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default LeaderReportReview;
