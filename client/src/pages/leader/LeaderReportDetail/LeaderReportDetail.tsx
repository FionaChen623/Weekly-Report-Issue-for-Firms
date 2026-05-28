import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportList } from '@shared/static/mockData';
import type { IReport } from '@/types';
import { toast } from 'sonner';
import ReportDetailSection from '../LeaderReportReview/ReportDetailSection';

const LeaderReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reports, setReports] = useState<IReport[]>(reportList as IReport[]);

  const report = reports.find((r) => r.id === id);

  if (!report) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leader/reports')}>
            <ArrowLeftIcon className="size-4 mr-1" />
            返回
          </Button>
        </div>
        <div className="p-12 text-center text-muted-foreground">
          <p>未找到该周报</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/leader/reports')}>
            返回周报列表
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitReview = (data: { action: 'approve' | 'reject'; comment: string }) => {
    // 模拟提交审核
    const updatedReports = reports.map((r) => {
      if (r.id === report.id) {
        return {
          ...r,
          leaderReviewed: true,
          leaderReviewedBy: 'user-002', // 当前组长ID
          leaderReviewedByName: '李开发',
          leaderReviewedAt: new Date().toISOString(),
          leaderReviewComments: data.comment,
          status: data.action === 'reject' ? 'needs_revision' : r.status,
        } as IReport;
      }
      return r;
    });

    setReports(updatedReports);

    if (data.action === 'approve') {
      toast.success('周报已通过审核，将提交给管理员终审');
    } else {
      toast.info('周报已打回，组员需要修改后重新提交');
    }

    // 延迟返回列表
    setTimeout(() => {
      navigate('/leader/reports');
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/leader/reports')}>
          <ArrowLeftIcon className="size-4 mr-1" />
          返回周报列表
        </Button>
      </div>

      {/* 周报详情 */}
      <ReportDetailSection report={report} onSubmitReview={handleSubmitReview} />
    </div>
  );
};

export default LeaderReportDetail;
