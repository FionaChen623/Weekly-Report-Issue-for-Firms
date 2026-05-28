import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BellIcon, CalendarIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { IReminderSettings } from '@/types';
import { reminderSettings as defaultSettings } from '@shared/static/mockData';
import { logger } from '@lark-apaas/client-toolkit/logger';

const weekDays = [
  { value: '0', label: '周日' },
  { value: '1', label: '周一' },
  { value: '2', label: '周二' },
  { value: '3', label: '周三' },
  { value: '4', label: '周四' },
  { value: '5', label: '周五' },
  { value: '6', label: '周六' },
];

const ReminderFormSection: React.FC = () => {
  const [settings, setSettings] = useState<IReminderSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = <K extends keyof IReminderSettings>(
    key: K,
    value: IReminderSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleWeeklyDeadlineChange = (field: 'dayOfWeek' | 'hour' | 'minute', value: number) => {
    setSettings((prev) => ({
      ...prev,
      weeklyReportDeadline: { ...prev.weeklyReportDeadline, [field]: value },
    }));
    setHasChanges(true);
  };

  const handlePreReminderChange = (field: 'enabled' | 'hoursBefore', value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      preDeadlineReminder: { ...prev.preDeadlineReminder, [field]: value },
    }));
    setHasChanges(true);
  };

  const handlePostReminderChange = (
    field: 'enabled' | 'hoursAfter' | 'repeatDaily',
    value: boolean | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      postDeadlineReminder: { ...prev.postDeadlineReminder, [field]: value },
    }));
    setHasChanges(true);
  };

  const handleTaskDueReminderChange = (field: 'enabled' | 'daysBefore', value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      taskDueReminder: { ...prev.taskDueReminder, [field]: value },
    }));
    setHasChanges(true);
  };

  const handleTaskOverdueReminderChange = (field: 'enabled' | 'repeatDaily', value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      taskOverdueReminder: { ...prev.taskOverdueReminder, [field]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    logger.info('保存设置:', String(settings));
    toast.success('提醒设置已保存');
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(false);
    toast.info('设置已重置');
  };

  return (
    <section className="w-full space-y-6">
      {/* 周报截止日设置 */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-5 text-primary" />
            <CardTitle className="text-base font-semibold">周报截止日设置</CardTitle>
          </div>
          <CardDescription>设置每周周报提交的截止日期和时间</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline-day">截止日</Label>
              <Select
                value={String(settings.weeklyReportDeadline.dayOfWeek)}
                onValueChange={(value) => handleWeeklyDeadlineChange('dayOfWeek', parseInt(value))}
              >
                <SelectTrigger id="deadline-day">
                  <SelectValue placeholder="选择星期" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-hour">小时</Label>
              <Input
                id="deadline-hour"
                type="number"
                min={0}
                max={23}
                value={settings.weeklyReportDeadline.hour}
                onChange={(e) => handleWeeklyDeadlineChange('hour', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-minute">分钟</Label>
              <Input
                id="deadline-minute"
                type="number"
                min={0}
                max={59}
                value={settings.weeklyReportDeadline.minute}
                onChange={(e) => handleWeeklyDeadlineChange('minute', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 周报提交前提醒 */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="size-5 text-warning" />
              <CardTitle className="text-base font-semibold">周报提交前提醒</CardTitle>
            </div>
            <Switch
              checked={settings.preDeadlineReminder.enabled}
              onCheckedChange={(checked) => handlePreReminderChange('enabled', checked)}
            />
          </div>
          <CardDescription>在截止前提醒尚未提交周报的成员</CardDescription>
        </CardHeader>
        {settings.preDeadlineReminder.enabled && (
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pre-reminder-hours">提前提醒时间（小时）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pre-reminder-hours"
                  type="number"
                  min={1}
                  max={168}
                  className="w-32"
                  value={settings.preDeadlineReminder.hoursBefore}
                  onChange={(e) => handlePreReminderChange('hoursBefore', parseInt(e.target.value) || 1)}
                />
                <span className="text-sm text-muted-foreground">小时前提醒</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 周报逾期提醒 */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="size-5 text-destructive" />
              <CardTitle className="text-base font-semibold">周报逾期提醒</CardTitle>
            </div>
            <Switch
              checked={settings.postDeadlineReminder.enabled}
              onCheckedChange={(checked) => handlePostReminderChange('enabled', checked)}
            />
          </div>
          <CardDescription>截止后提醒仍未提交周报的成员</CardDescription>
        </CardHeader>
        {settings.postDeadlineReminder.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="post-reminder-hours">首次提醒时间（小时）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="post-reminder-hours"
                  type="number"
                  min={1}
                  max={72}
                  className="w-32"
                  value={settings.postDeadlineReminder.hoursAfter}
                  onChange={(e) => handlePostReminderChange('hoursAfter', parseInt(e.target.value) || 1)}
                />
                <span className="text-sm text-muted-foreground">小时后首次提醒</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="repeat-daily"
                checked={settings.postDeadlineReminder.repeatDaily}
                onCheckedChange={(checked) => handlePostReminderChange('repeatDaily', checked)}
              />
              <Label htmlFor="repeat-daily" className="text-sm cursor-pointer">
                每日重复提醒直至提交
              </Label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 任务到期提醒 */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-5 text-info" />
              <CardTitle className="text-base font-semibold">任务到期提醒</CardTitle>
            </div>
            <Switch
              checked={settings.taskDueReminder.enabled}
              onCheckedChange={(checked) => handleTaskDueReminderChange('enabled', checked)}
            />
          </div>
          <CardDescription>在任务截止前提醒负责人</CardDescription>
        </CardHeader>
        {settings.taskDueReminder.enabled && (
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="task-due-days">提前提醒时间（天）</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="task-due-days"
                  type="number"
                  min={1}
                  max={7}
                  className="w-32"
                  value={settings.taskDueReminder.daysBefore}
                  onChange={(e) => handleTaskDueReminderChange('daysBefore', parseInt(e.target.value) || 1)}
                />
                <span className="text-sm text-muted-foreground">天前提醒</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 任务逾期提醒 */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="size-5 text-destructive" />
              <CardTitle className="text-base font-semibold">任务逾期提醒</CardTitle>
            </div>
            <Switch
              checked={settings.taskOverdueReminder.enabled}
              onCheckedChange={(checked) => handleTaskOverdueReminderChange('enabled', checked)}
            />
          </div>
          <CardDescription>对逾期任务进行提醒</CardDescription>
        </CardHeader>
        {settings.taskOverdueReminder.enabled && (
          <CardContent>
            <div className="flex items-center gap-2">
              <Switch
                id="task-repeat-daily"
                checked={settings.taskOverdueReminder.repeatDaily}
                onCheckedChange={(checked) => handleTaskOverdueReminderChange('repeatDaily', checked)}
              />
              <Label htmlFor="task-repeat-daily" className="text-sm cursor-pointer">
                每日重复提醒直至完成
              </Label>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" onClick={handleReset}>
          重置
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges}>
          保存设置
        </Button>
      </div>
    </section>
  );
};

export default ReminderFormSection;
