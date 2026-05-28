import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import TaskFilterSection from './TaskFilterSection';
import TaskListSection from './TaskListSection';
import type { TaskStatus, ITask } from '@/types';
import { taskList, groupMembers } from '@shared/static/mockData';

interface ITaskManagementPageProps {}

const TaskManagement: React.FC<ITaskManagementPageProps> = () => {
  const navigate = useNavigate();

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('');

  // 重置筛选
  const handleResetFilters = () => {
    setStatusFilter('all');
    setAssigneeFilter('all');
    setGroupFilter('all');
    setDeadlineFilter('');
  };

  // 新建任务
  const handleCreateTask = () => {
    navigate('/admin/tasks/new');
  };

  // 根据筛选条件过滤任务
  const filteredTasks = useMemo(() => {
    return taskList.filter((task) => {
      // 状态筛选
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // 负责人筛选
      if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) {
        return false;
      }

      // 分组筛选 - 根据任务负责人的所属组过滤
      if (groupFilter !== 'all') {
        const groupMemberIds = groupMembers
          .filter((gm) => gm.groupId === groupFilter)
          .map((gm) => gm.userId);
        if (!groupMemberIds.includes(task.assigneeId)) {
          return false;
        }
      }

      // 截止日期筛选
      if (deadlineFilter && task.deadline !== deadlineFilter) {
        return false;
      }

      return true;
    });
  }, [statusFilter, assigneeFilter, groupFilter, deadlineFilter]);

  return (
    <>
      <section className="w-full mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">任务管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              创建、分配和跟踪团队任务，支持按分组和个人筛选，管理逾期提醒
            </p>
          </div>
          <Button onClick={handleCreateTask} className="shrink-0">
            <PlusIcon className="size-4 mr-2" />
            新建任务
          </Button>
        </div>
      </section>

      <section className="w-full mb-6">
        <TaskFilterSection
          statusFilter={statusFilter}
          assigneeFilter={assigneeFilter}
          groupFilter={groupFilter}
          deadlineFilter={deadlineFilter}
          onStatusChange={setStatusFilter}
          onAssigneeChange={setAssigneeFilter}
          onGroupChange={setGroupFilter}
          onDeadlineChange={setDeadlineFilter}
          onReset={handleResetFilters}
        />
      </section>

      <section className="w-full">
        <TaskListSection tasks={filteredTasks as ITask[]} />
      </section>
    </>
  );
};

export default TaskManagement;
