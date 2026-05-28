import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TiptapEditorComplete } from '@/components/business-ui/tiptap-editor';
import {
  ArrowLeftIcon,
  SaveIcon,
  SendIcon,
  CheckSquareIcon,
  FileTextIcon,
  ClockIcon,
  RotateCcwIcon,
} from 'lucide-react';
import { taskList } from '@shared/static/mockData';
import type { ITask } from '@/types';
import { showConfirm } from '@lark-apaas/client-toolkit';

interface IReportFormData {
  summary: string;
  plan: string;
  issues: string;
  relatedTaskIds: string[];
}

const STORAGE_KEY = '__global_weekly_draft_report';

const getCurrentWeekInfo = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    year: now.getFullYear(),
    weekNumber,
    periodStart: startOfWeek.toISOString().split('T')[0],
    periodEnd: endOfWeek.toISOString().split('T')[0],
  };
};

const WriteReport: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = useCurrentUserProfile();
  const weekInfo = getCurrentWeekInfo();
  
  const [formData, setFormData] = useState<IReportFormData>({
    summary: '',
    plan: '',
    issues: '',
    relatedTaskIds: [],
  });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'plan' | 'issues'>('summary');

  // 加载草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
        setLastSaved(new Date());
      } catch {
        // 忽略解析错误
      }
    }
  }, []);

  // 自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.summary || formData.plan || formData.issues) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleTaskToggle = (taskId: string) => {
    setFormData((prev) => ({
      ...prev,
      relatedTaskIds: prev.relatedTaskIds.includes(taskId)
        ? prev.relatedTaskIds.filter((id) => id !== taskId)
        : [...prev.relatedTaskIds, taskId],
    }));
  };

  const getMyTasks = (): ITask[] => {
    return taskList.filter((task) => task.assigneeId === userInfo.user_id) as ITask[];
  };

  const handleSubmit = async () => {
    if (!formData.summary.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // 清除草稿
    localStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  const handleSaveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setLastSaved(new Date());
  };

  const handleReset = async () => {
    if (await showConfirm('确定要清空所有内容吗？此操作不可恢复。')) {
      setFormData({
        summary: '',
        plan: '',
        issues: '',
        relatedTaskIds: [],
      });
      localStorage.removeItem(STORAGE_KEY);
      setLastSaved(null);
    }
  };

  const formatSaveTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const myTasks = getMyTasks();
  const selectedTasks = myTasks.filter((t) => formData.relatedTaskIds.includes(t.id));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 头部导航 */}
      <section className="w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeftIcon className="size-4 mr-1" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">写周报</h1>
            <p className="text-xs text-muted-foreground">
              {weekInfo.year}年 第{weekInfo.weekNumber}周 ({weekInfo.periodStart} ~ {weekInfo.periodEnd})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              <ClockIcon className="size-3 inline mr-1" />
              自动保存于 {formatSaveTime(lastSaved)}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcwIcon className="size-4 mr-1" />
            清空
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveDraft}>
            <SaveIcon className="size-4 mr-1" />
            保存草稿
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !formData.summary.trim()}>
            <SendIcon className="size-4 mr-1" />
            {isSubmitting ? '提交中...' : '提交周报'}
          </Button>
        </div>
      </section>

      {/* 周报内容编辑区 */}
      <section className="w-full">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileTextIcon className="size-5 text-primary" />
              <CardTitle className="text-base">周报内容</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 标签切换 */}
            <div className="flex items-center gap-1 p-1 bg-accent rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                本周工作总结
              </button>
              <button
                onClick={() => setActiveTab('plan')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'plan'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                下周工作计划
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  activeTab === 'issues'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                遇到的问题
              </button>
            </div>

            {/* 编辑器区域 */}
            <div className="space-y-2">
              {activeTab === 'summary' && (
                <>
                  <Label className="text-sm font-medium">本周工作总结 *</Label>
                  <TiptapEditorComplete
                    value={formData.summary}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, summary: value }))}
                    placeholder="请总结本周完成的主要工作..."
                    className="min-h-[200px]"
                  />
                </>
              )}
              {activeTab === 'plan' && (
                <>
                  <Label className="text-sm font-medium">下周工作计划</Label>
                  <TiptapEditorComplete
                    value={formData.plan}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, plan: value }))}
                    placeholder="请描述下周的工作计划..."
                    className="min-h-[200px]"
                  />
                </>
              )}
              {activeTab === 'issues' && (
                <>
                  <Label className="text-sm font-medium">遇到的问题（可选）</Label>
                  <TiptapEditorComplete
                    value={formData.issues}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, issues: value }))}
                    placeholder="请描述本周遇到的问题或需要的支持..."
                    className="min-h-[200px]"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 关联任务选择 */}
      <section className="w-full">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckSquareIcon className="size-5 text-success" />
              <CardTitle className="text-base">关联任务</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {myTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckSquareIcon className="size-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无分配给你的任务</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">选择本周处理的任务：</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {myTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        formData.relatedTaskIds.includes(task.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-accent'
                      }`}
                      onClick={() => handleTaskToggle(task.id)}
                    >
                      <Checkbox
                        checked={formData.relatedTaskIds.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              task.status === 'completed'
                                ? 'bg-success/10 text-success'
                                : task.status === 'overdue'
                                ? 'bg-destructive/10 text-destructive'
                                : task.status === 'in_progress'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {task.status === 'completed'
                              ? '已完成'
                              : task.status === 'overdue'
                              ? '已逾期'
                              : task.status === 'in_progress'
                              ? '进行中'
                              : '未开始'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {task.description || '暂无描述'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTasks.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs text-muted-foreground">已选择 {selectedTasks.length} 个任务</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setFormData((prev) => ({ ...prev, relatedTaskIds: [] }))}
                    >
                      清空选择
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 底部操作栏 */}
      <section className="w-full flex items-center justify-between pt-4 border-t border-border">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeftIcon className="size-4 mr-1" />
            取消
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <SaveIcon className="size-4 mr-1" />
            保存草稿
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.summary.trim()}>
            <SendIcon className="size-4 mr-1" />
            {isSubmitting ? '提交中...' : '提交周报'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default WriteReport;
