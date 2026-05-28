import React, { useState } from 'react';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  UserIcon,
  MailIcon,
  BellIcon,
  SaveIcon,
  ShieldIcon,
  InfoIcon,
} from 'lucide-react';

export default function SettingsFormSection() {
  const userInfo = useCurrentUserProfile();
  const [isLoading, setIsLoading] = useState(false);

  // 个人信息
  const [formData, setFormData] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success('个人信息已保存');
    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2) : '??';
  };

  return (
    <section className="w-full space-y-6">
      {/* 个人信息卡片 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <UserIcon className="size-5 text-primary" />
            <CardTitle className="text-lg font-semibold">个人信息</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 头像区域 */}
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={userInfo?.avatar} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(formData.name || userInfo?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium text-foreground">头像</h4>
              <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式，大小不超过 2MB</p>
              <Button variant="outline" size="sm" className="mt-2">
                更换头像
              </Button>
            </div>
          </div>

          {/* 表单字段 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="请输入邮箱"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* 部门信息（只读） */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>部门</Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted/50 text-muted-foreground text-sm">
                产品部
                <Badge variant="secondary" className="ml-2 text-xs">不可修改</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>职位</Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-border bg-muted/50 text-muted-foreground text-sm">
                员工
                <Badge variant="secondary" className="ml-2 text-xs">不可修改</Badge>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="gap-2"
            >
              <SaveIcon className="size-4" />
              {isLoading ? '保存中...' : '保存修改'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 通知设置 - 改为只读提示 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BellIcon className="size-5 text-primary" />
            <CardTitle className="text-lg font-semibold">通知设置</CardTitle>
            <Badge variant="secondary" className="ml-2">
              <ShieldIcon className="size-3 mr-1" />
              管理员配置
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-info/10 border-info/20">
            <InfoIcon className="size-4 text-info" />
            <AlertTitle>通知由管理员统一管理</AlertTitle>
            <AlertDescription>
              周报提交提醒、任务到期提醒等通知设置由团队管理员统一配置，
              所有员工将自动接收相关通知。如需调整，请联系管理员。
            </AlertDescription>
          </Alert>

          {/* 当前启用的通知列表（只读展示） */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">周报提交提醒</span>
              </div>
              <Badge variant="outline" className="text-xs">已启用</Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">任务到期提醒</span>
              </div>
              <Badge variant="outline" className="text-xs">已启用</Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">任务逾期提醒</span>
              </div>
              <Badge variant="outline" className="text-xs">已启用</Badge>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">周报审核通知</span>
              </div>
              <Badge variant="outline" className="text-xs">已启用</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
