import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TiptapEditorComplete } from '@/components/business-ui/tiptap-editor';
import {
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  CircleIcon,
  SaveIcon,
  SendIcon,
  XIcon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ITask, TaskStatus } from '@/types';
import { taskList } from '@shared/static/mockData';

const statusConfig: Record<TaskStatus, { label: string; icon: typeof CircleIcon; color: string }> = {
  todo: {
    label: '未开始',
    icon: CircleIcon,
    color: 'text-muted-foreground',
  },
  in_progress: {
    label: '进行中',
    icon: ClockIcon,
    color: 'text-primary',
  },
  completed: {
    label: '已完成',
    icon: CheckCircleIcon,
    color: 'text-success',
  },
  overdue: {
    label: '已逾期',
    icon: AlertCircleIcon,
    color: 'text-destructive',
  },
};

const STORAGE_KEY = '__global_weekly_report_draft';

export default function ReportEditorSection() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState('');
  const [plan, setPlan] = useState('');
  const [issues, setIssues] = useState('');
  const [relatedTasks, setRelatedTasks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 获取当前用户的任务列表
  const myTasks = taskList.filter((task) => task.assigneeId === 'user-001');

  // 计算当前周次
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const daysPassed = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const currentWeek = Math.ceil((daysPassed + startOfYear.getDay() + 1) / 7);

  // 周次选项（当前周及前后各2周）
  const weekOptions = Array.from({ length: 5 }, (_, i) => {
    const week = currentWeek - 2 + i;
    const startDate = new Date(currentYear, 0, 1 + (week - 1) * 7 - startOfYear.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return {
      value: `${currentYear}-W${week}`,
      label: `第${week}周 (${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()})`,
    };
  });

  // 自动加载草稿
  useEffect(() => {
    try {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const parsed = JSON.parse(draft);
        setSummary(parsed.summary || '');
        setPlan(parsed.plan || '');
        setIssues(parsed.issues || '');
        setRelatedTasks(parsed.relatedTasks || []);
        setSelectedWeek(parsed.selectedWeek || `${currentYear}-W${currentWeek}`);
      } else {
        setSelectedWeek(`${currentYear}-W${currentWeek}`);
      }
    } catch {
      setSelectedWeek(`${currentYear}-W${currentWeek}`);
    }
  }, [currentYear, currentWeek]);

  // 自动保存草稿
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = {
        summary,
        plan,
        issues,
        relatedTasks,
        selectedWeek,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setLastSavedAt(new Date());
    }, 3000);

    return () => clearTimeout(timer);
  }, [summary, plan, issues, relatedTasks, selectedWeek]);

  const handleToggleTask = (taskId: string) => {
    setRelatedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    const draft = {
      summary,
      plan,
      issues,
      relatedTasks,
      selectedWeek,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedAt(new Date());
      toast.success('草稿已保存');
    }, 500);
  };

  const handleSubmit = () => {
    if (!summary.trim()) {
      toast.error('请填写本周工作总结');
      return;
    }
    if (!plan.trim()) {
      toast.error('请填写下周工作计划');
      return;
    }

    setIsSaving(true);
    // 模拟提交
    setTimeout(() => {
      setIsSaving(false);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('周报提交成功');
      navigate('/');
    }, 1000);
  };

  const handleCancel = () => {
    navigate('/');
  };

  const getSelectedTask = (taskId: string) => myTasks.find((t) => t.id === taskId);

  return (
    <section className="w-full max-w-4xl mx-auto space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">写周报</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {lastSavedAt ? `上次保存: ${lastSavedAt.toLocaleTimeString('zh-CN')}` : '开始撰写您的周报'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            <XIcon className="size-4 mr-1" />
            取消
          </Button>
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
            <SaveIcon className="size-4 mr-1" />
            保存草稿
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="bg-primary hover:bg-primary/90">
            <SendIcon className="size-4 mr-1" />
            提交周报
          </Button>
        </div>
      </div>

      {/* 周报周期选择 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="week-select">选择周期</Label>
              <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                <SelectTrigger id="week-select" className="w-full sm:w-[320px]">
                  <SelectValue placeholder="选择周报周期" />
                </SelectTrigger>
                <SelectContent>
                  {weekOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 本周工作总结 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            本周工作总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditorComplete
            value={summary}
            onValueChange={setSummary}
            placeholder="总结本周完成的主要工作、项目进展、成果等..."
          />
        </CardContent>
      </Card>

      {/* 下周工作计划 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            下周工作计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditorComplete
            value={plan}
            onValueChange={setPlan}
            placeholder="规划下周的工作目标、重点任务、时间安排等..."
          />
        </CardContent>
      </Card>

      {/* 遇到的问题 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-warning rounded-full" />
            遇到的问题
            <span className="text-xs text-muted-foreground font-normal">(可选)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TiptapEditorComplete
            value={issues}
            onValueChange={setIssues}
            placeholder="描述本周工作中遇到的困难、需要支持的事项、风险点等..."
          />
        </CardContent>
      </Card>

      {/* 关联任务 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="w-1 h-5 bg-info rounded-full" />
            关联任务
            <span className="text-xs text-muted-foreground font-normal">(可选)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 已选任务 */}
          {relatedTasks.length > 0 && (
            <div className="mb-4">
              <Label className="text-sm text-muted-foreground mb-2 block">已选任务</Label>
              <div className="flex flex-wrap gap-2">
                {relatedTasks.map((taskId) => {
                  const task = getSelectedTask(taskId);
                  if (!task) return null;
                  const status = statusConfig[task.status];
                  const StatusIcon = status.icon;
                  return (
                    <Badge
                      key={taskId}
                      variant="secondary"
                      className="cursor-pointer hover:bg-accent gap-1.5 py-1.5"
                      onClick={() => handleToggleTask(taskId)}
                    >
                      <StatusIcon className={`size-3 ${status.color}`} />
                      <span className="max-w-[150px] truncate">{task.title}</span>
                      <XIcon className="size-3 ml-1 opacity-50 hover:opacity-100" />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* 任务选择列表 */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">点击添加任务</Label>
            <div className="space-y-2 max-h-[240px] overflow-y-auto rounded-lg border border-border p-2">
              {myTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CircleIcon className="size-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">暂无任务</p>
                </div>
              ) : (
                myTasks.map((task) => {
                  const status = statusConfig[task.status];
                  const StatusIcon = status.icon;
                  const isSelected = relatedTasks.includes(task.id);

                  return (
                    <button
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-md text-left transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border border-primary/20'
                          : 'hover:bg-accent border border-transparent'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-input bg-background'
                        }`}
                      >
                        {isSelected && <CheckIcon className="size-3.5 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`flex items-center gap-1 text-xs ${status.color}`}>
                            <StatusIcon className="size-3" />
                            {status.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            截止: {task.deadline}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
