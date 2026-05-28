import { useState } from 'react';
import { FileTextIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReportListSection from './ReportListSection';

const WeeklyReportReview = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [weekFilter, setWeekFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleResetFilters = () => {
    setStatusFilter('all');
    setWeekFilter('');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || weekFilter || searchQuery;

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">周报审核</h1>
            <p className="text-sm text-muted-foreground mt-1">
              查看和审阅团队成员提交的周报
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
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="审核状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending_leader">待组长审核（组员）</SelectItem>
                <SelectItem value="pending_admin">待管理员审核（组长）</SelectItem>
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

      {/* 周报列表 */}
      <section className="w-full">
        <ReportListSection 
          statusFilter={statusFilter}
          weekFilter={weekFilter}
          searchQuery={searchQuery}
        />
      </section>
    </div>
  );
};

export default WeeklyReportReview;
