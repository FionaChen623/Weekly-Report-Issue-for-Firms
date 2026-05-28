import React from 'react';
import { SettingsIcon, BellIcon } from 'lucide-react';
import ReminderFormSection from './ReminderFormSection';

const ReminderSettings: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 页面标题区 */}
      <section className="w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <BellIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">提醒设置</h1>
            <p className="text-sm text-muted-foreground">配置系统自动提醒规则</p>
          </div>
        </div>
      </section>

      {/* 提醒表单区 */}
      <ReminderFormSection />
    </div>
  );
};

export default ReminderSettings;
