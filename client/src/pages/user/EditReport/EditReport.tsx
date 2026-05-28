import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeftIcon,
  SaveIcon,
  SendIcon,
  FileTextIcon,
  CalendarIcon,
  CheckSquareIcon,
  Loader2Icon,
} from 'lucide-react';
import { TiptapEditorComplete } from '@/components/business-ui/tiptap-editor';
import { reportList, taskList } from '@shared/static/mockData';
import type { IReport, ITask } from '@/types';
import { logger } from '@lark-apaas/client-toolkit/logger';

const EditReport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单状态
  const [weekNumber, setWeekNumber] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [plan, setPlan] = useState<string>('');
  const [issues, setIssues] = useState<string>('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // 获取周报数据
  useEffect(() => {
    const report = reportList.find((r) => r.id === id);
    if (report) {
      setWeekNumber(String(report.weekNumber));
      setSummary(report.content.summary);
      setPlan(report.content.plan);
      setIssues(report.content.issues || '');
      setSelectedTasks(report.relatedTaskIds || []);
    }
    setIsLoading(false);
  }, [id]);

  // 获取当前用户的任务列表
  const currentUserTasks: ITask[] = taskList.filter(
    (task) => task.assigneeId === 'user-001' // 模拟当前用户
  ) as ITask[];

  // 获取当前周报数据
  const currentReport: IReport | undefined = reportList.find((r) => r.id === id) as IReport | undefined;

  // 自动保存草稿
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      logger.info('自动保存草稿:', String({ weekNumber, summary, plan, issues, selectedTasks }));
    }, 5000);

    return () => clearTimeout(timer);
  }, [weekNumber, summary, plan, issues, selectedTasks, isLoading]);

  // 保存草稿
  const handleSaveDraft = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    logger.info('保存草稿:', String({ weekNumber, summary, plan, issues, selectedTasks }));
    setIsSaving(false);
  };

  // 提交周报
  const handleSubmit = async () => {
    if (!weekNumber || !summary || !plan) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    logger.info('提交周报:', String({ weekNumber, summary, plan, issues, selectedTasks }));
    setIsSubmitting(false);
    navigate('/');
  };

  // 切换任务选择
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  // 获取状态配置
  const getStatusConfig = (status: IReport['status']) => {
    const configs = {
      draft: { label: '草稿', color: 'bg-muted text-muted-foreground' },
      submitted: { label: '已提交', color: 'bg-warning/10 text-warning' },
      reviewed: { label: '已审核', color: 'bg-success/10 text-success' },
      needs_revision: { label: '需修改', color: 'bg-destructive/10 text-destructive' },
    };
    return configs[status];
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2Icon className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentReport) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeftIcon className="size-4 mr-1" />
              返回
            </Link>
          </Button>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <FileTextIcon className="size-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">未找到该周报</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/">返回周报列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentReport.status);
  const canEdit = currentReport.status === 'draft' || currentReport.status === 'needs_revision';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* 页面标题 */}
      <section className="w-full">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeftIcon className="size-4 mr-2" />
              返回
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">编辑周报</h1>
              <Badge variant="secondary" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {currentReport.year}年 第{currentReport.weekNumber}周 ({currentReport.periodStart} ~ {currentReport.periodEnd})
            </p>
          </div>
        </div>
      </section>

      {/* 编辑表单 */}
      {canEdit ? (
        <section className="w-full space-y-6">
          {/* 周次选择 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                周报周期
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="week-number">
                    周次 <span className="text-destructive">*</span>
                  </Label>
                  <Select value={weekNumber} onValueChange={setWeekNumber}>
                    <SelectTrigger id="week-number">
                      <SelectValue placeholder="选择周次" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const week = 21 - i;
                        return (
                          <SelectItem key={week} value={String(week)}>
                            第{week}周
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 本周工作总结 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileTextIcon className="size-4 text-primary" />
                本周工作总结 <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TiptapEditorComplete
                value={summary}
                onValueChange={setSummary}
                placeholder="请描述本周完成的主要工作内容、项目进展、取得的成果等..."
              />
            </CardContent>
          </Card>

          {/* 下周工作计划 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                下周工作计划 <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TiptapEditorComplete
                value={plan}
                onValueChange={setPlan}
                placeholder="请描述下周的工作计划、目标、重点任务等..."
              />
            </CardContent>
          </Card>

          {/* 遇到的问题 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileTextIcon className="size-4 text-warning" />
                遇到的问题（选填）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="请描述本周工作中遇到的问题、困难或需要的支持..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* 关联任务 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckSquareIcon className="size-4 text-success" />
                关联任务（选填）
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentUserTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  暂无可关联的任务
                </p>
              ) : (
                <div className="space-y-3">
                  {currentUserTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => toggleTaskSelection(task.id)}
                    >
                      <Checkbox
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{task.title}</p>
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
                          {task.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <section className="w-full flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  保存草稿
                </>
              )}
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/">取消</Link>
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !weekNumber || !summary || !plan}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <SendIcon className="size-4" />
                    提交周报
                  </>
                )}
              </Button>
            </div>
          </section>
        </section>
      ) : (
        /* 不可编辑状态 - 只读展示 */
        <section className="w-full space-y-6">
          <Card className="border-l-4 border-l-warning">
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                该周报已提交审核，无法编辑。如需修改，请联系管理员退回。
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">本周工作总结</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">下周工作计划</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: plan }}
              />
            </CardContent>
          </Card>

          {issues && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">遇到的问题</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {issues}
                </p>
              </CardContent>
            </Card>
          )}

          <section className="w-full flex justify-end">
            <Button asChild>
              <Link to="/">返回周报列表</Link>
            </Button>
          </section>
        </section>
      )}
    </div>
  );
};

export default EditReport;
