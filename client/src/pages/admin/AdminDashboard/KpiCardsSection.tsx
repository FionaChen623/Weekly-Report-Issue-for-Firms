import { Card, CardContent } from '@/components/ui/card';
import { FileTextIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, UsersIcon, ShieldIcon, UserCheckIcon } from 'lucide-react';
import { reportList, taskList, dashboardStats, groupList } from '@shared/static/mockData';
import type { IReport } from '@/types';

export default function KpiCardsSection() {
  const typedReportList = reportList as IReport[];

  // 判断用户是否是组长
  const isLeader = (userId: string): boolean => {
    return groupList.some((g) => g.leaderId === userId);
  };

  // 组员待审核（组长未审）
  const pendingMemberReview = typedReportList.filter(
    (r) => !isLeader(r.authorId) && r.status === 'submitted' && !r.leaderReviewed
  ).length;

  // 组长待管理员审核（组长的周报直接提交给管理员，不需要自审）
  const pendingLeaderAdminReview = typedReportList.filter(
    (r) => isLeader(r.authorId) && r.status === 'submitted'
  ).length;

  // 组员已审核（组长已审）
  const memberReviewed = typedReportList.filter(
    (r) => !isLeader(r.authorId) && r.leaderReviewed
  ).length;

  // 组长已终审
  const leaderReviewed = typedReportList.filter(
    (r) => isLeader(r.authorId) && r.status === 'reviewed'
  ).length;

  // 需修改
  const needsRevision = typedReportList.filter(
    (r) => r.status === 'needs_revision'
  ).length;

  const { weeklySubmissionRate, submittedCount, totalMemberCount, overdueTaskCount } = dashboardStats;

  const kpiData = [
    {
      label: '本周提交率',
      value: `${weeklySubmissionRate}%`,
      subtext: `${submittedCount}/${totalMemberCount} 人已提交`,
      icon: FileTextIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: '组员待审核',
      value: String(pendingMemberReview),
      subtext: '需组长处理',
      icon: UsersIcon,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: '组长待审核',
      value: String(pendingLeaderAdminReview),
      subtext: '需管理员审批',
      icon: ShieldIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: '逾期任务',
      value: String(overdueTaskCount),
      subtext: '需立即处理',
      icon: AlertCircleIcon,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  // 二级统计卡片
  const secondaryStats = [
    {
      label: '组员已审核',
      value: memberReviewed,
      color: 'text-success',
    },
    {
      label: '组长已审核',
      value: leaderReviewed,
      color: 'text-success',
    },
    {
      label: '需修改',
      value: needsRevision,
      color: 'text-destructive',
    },
  ];

  return (
    <section className="w-full space-y-4">
      {/* 主要KPI卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item) => (
          <Card key={item.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {item.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.subtext}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`size-5 ${item.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 二级统计 */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <span className="text-sm text-muted-foreground">审核状态分布：</span>
        {secondaryStats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className={`text-lg font-semibold ${stat.color}`}>{stat.value}</span>
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
