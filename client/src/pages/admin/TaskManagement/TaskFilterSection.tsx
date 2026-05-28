import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { XIcon, FilterIcon, UsersIcon } from 'lucide-react';
import type { TaskStatus } from '@/types';
import { teamMembers, groupList, groupMembers } from '@shared/static/mockData';

interface ITaskFilterSectionProps {
  statusFilter: TaskStatus | 'all';
  assigneeFilter: string | 'all';
  groupFilter: string | 'all';
  deadlineFilter: string;
  onStatusChange: (value: TaskStatus | 'all') => void;
  onAssigneeChange: (value: string | 'all') => void;
  onGroupChange: (value: string | 'all') => void;
  onDeadlineChange: (value: string) => void;
  onReset: () => void;
}

const statusOptions: { value: TaskStatus | 'all'; label: string; color?: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'todo', label: '未开始', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: '进行中', color: 'bg-primary/10 text-primary' },
  { value: 'completed', label: '已完成', color: 'bg-success-bg text-success' },
  { value: 'overdue', label: '已逾期', color: 'bg-danger-bg text-destructive' },
];

const TaskFilterSection: React.FC<ITaskFilterSectionProps> = ({
  statusFilter,
  assigneeFilter,
  groupFilter,
  deadlineFilter,
  onStatusChange,
  onAssigneeChange,
  onGroupChange,
  onDeadlineChange,
  onReset,
}) => {
  const activeMember = teamMembers.find((m) => m.id === assigneeFilter);
  const activeStatus = statusOptions.find((s) => s.value === statusFilter);
  const activeGroup = groupList.find((g) => g.id === groupFilter);

  // 根据选中的组过滤成员列表
  const filteredMembers = React.useMemo(() => {
    if (groupFilter === 'all') {
      return teamMembers.filter((m) => m.isActive);
    }
    const memberIds = groupMembers
      .filter((gm) => gm.groupId === groupFilter)
      .map((gm) => gm.userId);
    return teamMembers.filter((m) => memberIds.includes(m.id) && m.isActive);
  }, [groupFilter]);

  const hasActiveFilters =
    statusFilter !== 'all' || assigneeFilter !== 'all' || groupFilter !== 'all' || deadlineFilter !== '';

  return (
    <section className="w-full">
      <div className="flex flex-col gap-4">
        {/* 筛选器行 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FilterIcon className="size-4" />
            <span>筛选</span>
          </div>

          {/* 分组筛选 - 新增 */}
          <Select
            value={groupFilter}
            onValueChange={(value) => {
              onGroupChange(value);
              // 切换分组时重置负责人筛选
              onAssigneeChange('all');
            }}
          >
            <SelectTrigger className="w-[150px] h-9">
              <UsersIcon className="size-4 mr-1 text-muted-foreground" />
              <SelectValue placeholder="分组" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分组</SelectItem>
              {groupList.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 负责人筛选 */}
          <Select
            value={assigneeFilter}
            onValueChange={(value) => onAssigneeChange(value)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="负责人" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部负责人</SelectItem>
              {filteredMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                  {member.role === 'leader' && (
                    <Badge variant="secondary" className="ml-2 text-xs">组长</Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 状态筛选 */}
          <Select
            value={statusFilter}
            onValueChange={(value) => onStatusChange(value as TaskStatus | 'all')}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.value !== 'all' && (
                      <span
                        className={`inline-block size-2 rounded-full ${
                          option.value === 'todo'
                            ? 'bg-muted-foreground'
                            : option.value === 'in_progress'
                            ? 'bg-primary'
                            : option.value === 'completed'
                            ? 'bg-success'
                            : 'bg-destructive'
                        }`}
                      />
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 截止日期筛选 */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={deadlineFilter}
              onChange={(e) => onDeadlineChange(e.target.value)}
              className="w-[150px] h-9"
              placeholder="截止日期"
            />
          </div>

          {/* 重置按钮 */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-4 mr-1" />
              重置
            </Button>
          )}
        </div>

        {/* 已选筛选标签 */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">已选:</span>
            {groupFilter !== 'all' && activeGroup && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent bg-warning/10 text-warning"
                onClick={() => {
                  onGroupChange('all');
                  onAssigneeChange('all');
                }}
              >
                <UsersIcon className="size-3 mr-1" />
                {activeGroup.name}
                <XIcon className="size-3 ml-1" />
              </Badge>
            )}
            {assigneeFilter !== 'all' && activeMember && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => onAssigneeChange('all')}
              >
                {activeMember.name}
                <XIcon className="size-3 ml-1" />
              </Badge>
            )}
            {statusFilter !== 'all' && activeStatus && (
              <Badge
                variant="secondary"
                className={`cursor-pointer hover:bg-accent ${activeStatus.color}`}
                onClick={() => onStatusChange('all')}
              >
                {activeStatus.label}
                <XIcon className="size-3 ml-1" />
              </Badge>
            )}
            {deadlineFilter && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-accent"
                onClick={() => onDeadlineChange('')}
              >
                截止: {deadlineFilter}
                <XIcon className="size-3 ml-1" />
              </Badge>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TaskFilterSection;
