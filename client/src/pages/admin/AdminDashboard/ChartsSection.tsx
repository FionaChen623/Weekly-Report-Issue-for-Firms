import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboardStats, groupList, reportList, groupMembers, teamMembers } from '@shared/static/mockData';
import type { IReport } from '@/types';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, FileTextIcon, UsersIcon, ShieldIcon } from 'lucide-react';

const ChartsSection: React.FC = () => {
  const { weeklyActivityData, groupStats } = dashboardStats;
  const typedReportList = reportList as IReport[];

  // 判断用户是否是组长
  const isLeader = (userId: string): boolean => {
    return groupList.some((g) => g.leaderId === userId);
  };

  // 趋势图配置
  const trendOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        return `${data.name}<br/>周报提交: ${data.value} 份`;
      },
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      show: false,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: weeklyActivityData.map((item) => item.week),
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'line',
        data: weeklyActivityData.map((item) => item.submissions),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          color: '#f97316',
          width: 3,
        },
        itemStyle: {
          color: '#f97316',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(249, 115, 22, 0.3)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  // 计算各组的周报审核状态
  const getGroupReportStats = (groupId: string) => {
    const memberIds = groupMembers
      .filter((gm) => gm.groupId === groupId)
      .map((gm) => gm.userId);
    
    const groupReports = typedReportList.filter((r) => memberIds.includes(r.authorId));
    const leaderId = groupList.find((g) => g.id === groupId)?.leaderId;
    
    // 组长的周报
    const leaderReports = groupReports.filter((r) => r.authorId === leaderId);
    // 组员的周报
    const memberReports = groupReports.filter((r) => r.authorId !== leaderId);
    
    return {
      // 组长状态（直接待管理员审核，不需要自审）
      leaderPendingAdmin: leaderReports.filter((r) => r.status === 'submitted').length,
      leaderReviewed: leaderReports.filter((r) => r.status === 'reviewed').length,
      leaderNeedsRevision: leaderReports.filter((r) => r.status === 'needs_revision').length,
      leaderDraft: leaderReports.filter((r) => r.status === 'draft').length,
      // 组员状态
      memberPending: memberReports.filter((r) => r.status === 'submitted' && !r.leaderReviewed).length,
      memberReviewed: memberReports.filter((r) => r.leaderReviewed).length,
      memberNeedsRevision: memberReports.filter((r) => r.status === 'needs_revision').length,
      memberDraft: memberReports.filter((r) => r.status === 'draft').length,
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* 趋势图 */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">
            团队活跃度趋势
          </CardTitle>
          <p className="text-xs text-muted-foreground">近4周周报提交情况</p>
        </CardHeader>
        <CardContent>
          <ReactECharts
            option={trendOption}
            theme="ud"
            className="h-[300px]"
            style={{ width: '100%' }}
          />
        </CardContent>
      </Card>

      {/* 分组视图 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">分组审核视图</h3>
          <p className="text-sm text-muted-foreground">各组周报审核状态概览</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groupList.map((group) => {
            const stats = getGroupReportStats(group.id);
            const leader = teamMembers.find((m) => m.id === group.leaderId);
            
            return (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">{group.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        组长: {leader?.name || group.leaderName}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {groupMembers.filter((gm) => gm.groupId === group.id).length} 人
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 组长周报区域 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ShieldIcon className="size-4 text-primary" />
                      <span>组长周报</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats.leaderPendingAdmin > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          待审核: {stats.leaderPendingAdmin}
                        </Badge>
                      )}
                      {stats.leaderReviewed > 0 && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          已审核: {stats.leaderReviewed}
                        </Badge>
                      )}
                      {stats.leaderNeedsRevision > 0 && (
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                          需修改: {stats.leaderNeedsRevision}
                        </Badge>
                      )}
                      {stats.leaderDraft > 0 && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          草稿: {stats.leaderDraft}
                        </Badge>
                      )}
                      {stats.leaderPendingAdmin === 0 && 
                       stats.leaderReviewed === 0 && stats.leaderNeedsRevision === 0 && stats.leaderDraft === 0 && (
                        <span className="text-sm text-muted-foreground">暂无数据</span>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* 组员周报区域 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <UsersIcon className="size-4 text-warning" />
                      <span>组员周报</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats.memberPending > 0 && (
                        <Badge variant="secondary" className="bg-warning/10 text-warning">
                          待审核: {stats.memberPending}
                        </Badge>
                      )}
                      {stats.memberReviewed > 0 && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          已审核: {stats.memberReviewed}
                        </Badge>
                      )}
                      {stats.memberNeedsRevision > 0 && (
                        <Badge variant="secondary" className="bg-destructive/10 text-destructive">
                          需修改: {stats.memberNeedsRevision}
                        </Badge>
                      )}
                      {stats.memberDraft > 0 && (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          草稿: {stats.memberDraft}
                        </Badge>
                      )}
                      {stats.memberPending === 0 && stats.memberReviewed === 0 && 
                       stats.memberNeedsRevision === 0 && stats.memberDraft === 0 && (
                        <span className="text-sm text-muted-foreground">暂无数据</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
