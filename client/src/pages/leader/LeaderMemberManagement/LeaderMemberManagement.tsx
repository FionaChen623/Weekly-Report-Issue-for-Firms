import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SearchIcon,
  PlusIcon,
  MoreHorizontalIcon,
  MailIcon,
  FileTextIcon,
  CheckSquareIcon,
  UserMinusIcon,
  UserIcon,
} from 'lucide-react';
import { groupMembers, teamMembers, currentUser } from '@shared/static/mockData';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

// 模拟当前组长所属组 - 实际应从用户信息获取
const CURRENT_GROUP_ID = 'group-001';

interface IGroupMemberInfo {
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  taskCount: number;
  reportCount: number;
}

const LeaderMemberManagement: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useCurrentUserProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<IGroupMemberInfo | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  // 获取当前组的成员列表
  const groupMemberList = useMemo(() => {
    const members = groupMembers.filter(gm => gm.groupId === CURRENT_GROUP_ID);
    return members.map(gm => {
      const user = teamMembers.find(tm => tm.id === gm.userId);
      return {
        userId: gm.userId,
        userName: gm.userName,
        email: user?.email || '',
        department: user?.department || '',
        role: user?.role || 'member',
        joinDate: gm.joinedAt,
        isActive: user?.isActive ?? true,
        taskCount: Math.floor(Math.random() * 10) + 1, // 模拟数据
        reportCount: Math.floor(Math.random() * 20) + 1, // 模拟数据
      };
    });
  }, []);

  // 过滤成员
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return groupMemberList;
    const query = searchQuery.toLowerCase();
    return groupMemberList.filter(
      member =>
        member.userName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query)
    );
  }, [groupMemberList, searchQuery]);

  // 统计
  const stats = useMemo(() => {
    const total = groupMemberList.length;
    const active = groupMemberList.filter(m => m.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [groupMemberList]);

  const handleViewTasks = (memberId: string) => {
    navigate(`/leader/tasks?member=${memberId}`);
  };

  const handleViewReports = (memberId: string) => {
    navigate(`/leader/reports?member=${memberId}`);
  };

  const handleRemoveMember = (member: IGroupMemberInfo) => {
    setSelectedMember(member);
    setRemoveDialogOpen(true);
  };

  const confirmRemove = () => {
    // 实际应调用API移除成员
    setRemoveDialogOpen(false);
    setSelectedMember(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">组成员管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理研发一组的成员，查看成员任务和周报情况
            </p>
          </div>
          <Button className="gap-2">
            <PlusIcon className="size-4" />
            <span>添加成员</span>
          </Button>
        </div>
      </section>

      {/* 统计卡片 */}
      <section className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">组成员总数</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-primary/10">
                <UserIcon className="size-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">在职成员</p>
                <p className="text-3xl font-bold text-success mt-1">{stats.active}</p>
              </div>
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-success/10">
                <CheckSquareIcon className="size-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已停用</p>
                <p className="text-3xl font-bold text-muted-foreground mt-1">{stats.inactive}</p>
              </div>
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-muted">
                <UserMinusIcon className="size-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 成员列表 */}
      <section className="w-full">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <CardTitle className="text-lg font-semibold">成员列表</CardTitle>
              <div className="relative flex-1 max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索成员姓名、邮箱或部门..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMembers.length === 0 ? (
              <div className="p-6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <SearchIcon className="size-6" />
                    </EmptyMedia>
                    <EmptyTitle>未找到成员</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery ? '请尝试其他搜索关键词' : '暂无组成员'}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">成员</TableHead>
                      <TableHead>部门</TableHead>
                      <TableHead>入组时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>任务/周报</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex aspect-square size-9 items-center justify-center rounded-full bg-primary/10">
                              <span className="text-sm font-medium text-primary">
                                {member.userName.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{member.userName}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">{member.department}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{member.joinDate}</span>
                        </TableCell>
                        <TableCell>
                          {member.isActive ? (
                            <Badge variant="outline" className="gap-1 text-success border-success/20 bg-success-bg">
                              <span className="size-1.5 rounded-full bg-success" />
                              在职
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <span className="size-1.5 rounded-full bg-muted-foreground" />
                              已停用
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleViewTasks(member.userId)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <CheckSquareIcon className="size-3.5" />
                              {member.taskCount} 任务
                            </button>
                            <button
                              onClick={() => handleViewReports(member.userId)}
                              className="flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              <FileTextIcon className="size-3.5" />
                              {member.reportCount} 周报
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <MoreHorizontalIcon className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewTasks(member.userId)}>
                                <CheckSquareIcon className="mr-2 size-4" />
                                查看任务
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleViewReports(member.userId)}>
                                <FileTextIcon className="mr-2 size-4" />
                                查看周报
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MailIcon className="mr-2 size-4" />
                                发送消息
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleRemoveMember(member)}
                              >
                                <UserMinusIcon className="mr-2 size-4" />
                                移出小组
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 移除成员确认对话框 */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>移出小组成员</DialogTitle>
            <DialogDescription>
              确定要将 <span className="font-medium text-foreground">{selectedMember?.userName}</span> 移出研发一组吗？
              该成员将不再接收本组的任务和周报提醒。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmRemove}>
              确认移出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaderMemberManagement;
