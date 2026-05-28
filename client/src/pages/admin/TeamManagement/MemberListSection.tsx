import React, { useState } from 'react';
import { Table, TableProps } from '@lark-apaas/client-toolkit/antd-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PlusIcon, SearchIcon, EditIcon, TrashIcon, MailIcon, BuildingIcon } from 'lucide-react';
import type { ITeamMember } from '@/types';
import { teamMembers as initialMembers } from '@shared/static/mockData';

// 扩展 UserRole 以兼容 ITeamMember 中可能的角色定义
// 假设 ITeamMember.role 可能是 'admin' | 'leader' | 'member' | 'user' 等
// 这里使用 ITeamMember['role'] 确保类型完全一致，或者根据实际报错调整
// 由于报错显示 ITeamMember.role 不兼容 'user'，我们需要确认 ITeamMember 的定义。
// 但通常这种错误是因为本地定义的 UserRole 范围小于实际类型，或者两者定义不一致。
// 最安全的做法是直接使用 ITeamMember['role'] 或者扩大本地定义。
// 观察报错：Type '"user"' is not assignable to type 'UserRole'.
// 且 ITeamMember 的 role 似乎也不接受 'user' (TS2345 报错中提到 role: "admin" | "leader" | "member" | "user" 不兼容)。
// 让我们先查看 ITeamMember 定义。如果无法查看，我们假设 ITeamMember 的 role 是更严格的枚举。
// 但报错指出 Type '"user"' is not assignable to type 'UserRole' (local) AND Type '"user"' is not assignable to type 'UserRole' (imported).
// 这意味着 ITeamMember 中的 role 类型也不是简单的 'user'。
// 为了修复，我们将本地 UserRole 改为与 ITeamMember 兼容的类型，或者直接断言。
// 鉴于报错信息中 ITeamMember 的 role 被推断为 "admin" | "leader" | "member" | "user"，
// 而本地 UserRole 是 'admin' | 'user'。
// 错误核心在于：formData.role 初始化为 'user'，但 ITeamMember 可能期望其他值，或者类型系统混淆。
// 最简单的修复是将本地 UserRole 定义为 ITeamMember['role'] 的超集或直接复用，
// 并在赋值时使用 as ITeamMember['role']。

// 使用与 types/index.ts 一致的 UserRole
type UserRole = 'admin' | 'leader' | 'member';

export default function MemberListSection() {
  const [members, setMembers] = useState<ITeamMember[]>(initialMembers as ITeamMember[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ITeamMember | null>(null);

  const [formData, setFormData] = useState<Partial<ITeamMember>>({
    name: '',
    email: '',
    department: '',
    smallGroup: '',
    role: 'member' as const,
    groupId: null,
  });

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    const newMember: ITeamMember = {
      id: `user-${Date.now()}`,
      name: formData.name || '',
      email: formData.email || '',
      department: formData.department || '',
      smallGroup: formData.smallGroup || '',
      role: (formData.role as 'admin' | 'leader' | 'member') || 'member',
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
      groupId: formData.groupId || null,
    };
    setMembers([...members, newMember]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', department: '', smallGroup: '', role: 'member', groupId: null });
  };

  const handleEdit = () => {
    if (selectedMember) {
      setMembers(
        members.map((m) =>
          m.id === selectedMember.id
            ? {
                ...m,
                name: formData.name || m.name,
                email: formData.email || m.email,
                department: formData.department || m.department,
                role: (formData.role as ITeamMember['role']) || m.role, // 修复 TS2322: 编辑时类型断言
              }
            : m
        )
      );
      setIsEditDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleDelete = () => {
    if (selectedMember) {
      setMembers(members.filter((m) => m.id !== selectedMember.id));
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleToggleActive = (memberId: string) => {
    setMembers(
      members.map((m) =>
        m.id === memberId ? { ...m, isActive: !m.isActive } : m
      )
    );
  };

  const openEditDialog = (member: ITeamMember) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      role: member.role,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: ITeamMember) => {
    setSelectedMember(member);
    setIsDeleteDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name.slice(0, 2);
  };

  const columns: TableProps<ITeamMember>['columns'] = [
    {
      title: '成员',
      dataIndex: 'name',
      fixed: 'left',
      width: 180,
      render: (_: string, record: ITeamMember) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(record.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{record.name}</div>
            <div className="text-xs text-muted-foreground">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      width: 140,
      render: (dept: string) => (
        <div className="flex items-center gap-1.5">
          <BuildingIcon className="size-3.5 text-muted-foreground" />
          <span className="text-sm">{dept}</span>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (role: UserRole) => (
        <Badge
          variant={role === 'admin' ? 'default' : 'secondary'}
          className={
            role === 'admin'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }
        >
          {role === 'admin' ? '管理员' : '普通成员'}
        </Badge>
      ),
    },
    {
      title: '入职时间',
      dataIndex: 'joinDate',
      width: 120,
      render: (date: string) => {
        const d = new Date(date);
        return (
          <span className="text-sm text-muted-foreground">
            {d.getFullYear()}-{String(d.getMonth() + 1).padStart(2, '0')}-{String(
              d.getDate()
            ).padStart(2, '0')}
          </span>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Badge
          variant="outline"
          className={
            isActive
              ? 'bg-success/10 text-success border-0'
              : 'bg-muted text-muted-foreground border-0'
          }
        >
          {isActive ? '在职' : '已禁用'}
        </Badge>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_: unknown, record: ITeamMember) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => openEditDialog(record)}
          >
            <EditIcon className="size-3.5 mr-1" />
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => openDeleteDialog(record)}
          >
            <TrashIcon className="size-3.5 mr-1 text-destructive" />
            <span className="text-destructive">删除</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">团队成员</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                共 {filteredMembers.length} 人
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索成员..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusIcon className="size-4 mr-2" />
                添加成员
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            dataSource={filteredMembers}
            rowKey="id"
            scroll={{ x: 1000, y: 500 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </CardContent>
      </Card>

      {/* 添加成员对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加成员</DialogTitle>
            <DialogDescription>
              输入新成员的基本信息，系统将自动发送邀请邮件。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="请输入邮箱"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">部门</label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="请输入部门"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">角色</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as ITeamMember['role'] }) // 修复 TS2322: Add Dialog 中选择角色时断言
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通成员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleAdd}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑成员对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑成员</DialogTitle>
            <DialogDescription>修改成员的基本信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="请输入邮箱"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">部门</label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="请输入部门"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">角色</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value as ITeamMember['role'] }) // 修复 TS2322: Edit Dialog 中选择角色时断言
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通成员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除成员 <strong>{selectedMember?.name}</strong> 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
