import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UsersIcon, PlusIcon } from 'lucide-react';
import MemberListSection from './MemberListSection';

const TeamManagement = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* 页面标题区 */}
      <section className="w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <UsersIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">团队管理</h1>
              <p className="text-sm text-muted-foreground">管理团队成员信息和权限</p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="size-4 mr-1" />
            添加成员
          </Button>
        </div>
      </section>

      {/* 成员列表 */}
      <section className="w-full">
        <MemberListSection />
      </section>
    </div>
  );
};

export default TeamManagement;
