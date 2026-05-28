import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  UsersIcon,
  CheckSquareIcon,
  FileTextIcon,
  AlertCircleIcon,
  LayoutGridIcon,
  BarChart3Icon,
  ChevronRightIcon,
} from 'lucide-react';
import KpiCardsSection from './KpiCardsSection';
import ChartsSection from './ChartsSection';
import RecentTasksSection from './RecentTasksSection';
import { dashboardStats, groupList } from '@shared/static/mockData';

// 组统计卡片组件
function GroupStatCard({ group }: { group: typeof dashboardStats.groupStats[0] }) {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{group.groupName}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              组长: {group.leaderName} · {group.memberCount}人
            </p>
          </div>
          <Badge variant={group.overdueTaskCount > 0 ? 'destructive' : 'secondary'} className="text-xs">
            {group.overdueTaskCount > 0 ? `${group.overdueTaskCount} 逾期` : '正常'}
          </Badge>
        </div>

        <div className="mt-4 space-y-3">
          {/* 任务完成率 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckSquareIcon className="size-3" />
                任务完成率
              </span>
              <span className="font-medium text-foreground">{group.taskCompletionRate}%</span>
            </div>
            <Progress value={group.taskCompletionRate} className="h-1.5" />
          </div>

          {/* 周报提交率 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileTextIcon className="size-3" />
                周报提交率
              </span>
              <span className="font-medium text-foreground">{group.weeklySubmissionRate}%</span>
            </div>
            <Progress value={group.weeklySubmissionRate} className="h-1.5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <AlertCircleIcon className="size-3 text-danger" />
              {group.pendingReportCount} 待交周报
            </span>
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
            详情
            <ChevronRightIcon className="size-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 分组概览组件
function GroupOverview() {
  const groupStats = dashboardStats.groupStats || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">分组概览</h2>
        </div>
        <Badge variant="secondary">共 {groupStats.length} 个组</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupStats.map((group) => (
          <GroupStatCard key={group.groupId} group={group} />
        ))}
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">管理仪表盘</h1>
            <p className="text-sm text-muted-foreground mt-1">
              全面掌握团队周报提交和任务完成情况，支持全局与分组双视图
            </p>
          </div>
          <Badge variant="default" className="text-xs">
            <BarChart3Icon className="size-3 mr-1" />
            第21周
          </Badge>
        </div>
      </section>

      {/* 视图切换 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3Icon className="size-4" />
            全局视图
          </TabsTrigger>
          <TabsTrigger value="groups" className="gap-2">
            <LayoutGridIcon className="size-4" />
            分组视图
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* KPI 统计卡片 */}
          <KpiCardsSection />

          {/* 图表和逾期任务 */}
          <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartsSection />
            </div>
            <div className="lg:col-span-1">
              <RecentTasksSection />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="groups" className="mt-6 space-y-6">
          {/* 分组概览 */}
          <GroupOverview />

          {/* 各组详细统计 */}
          <section className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3Icon className="size-5 text-primary" />
                    各组趋势对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats.groupStats?.map((group) => (
                      <div key={group.groupId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">{group.groupName}</span>
                            <span className="text-sm text-muted-foreground">{group.leaderName}</span>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-lg font-semibold text-foreground">{group.memberCount}</p>
                              <p className="text-xs text-muted-foreground">成员</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-success">{group.taskCompletionRate}%</p>
                              <p className="text-xs text-muted-foreground">任务完成</p>
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-primary">{group.weeklySubmissionRate}%</p>
                              <p className="text-xs text-muted-foreground">周报提交</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <RecentTasksSection />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
