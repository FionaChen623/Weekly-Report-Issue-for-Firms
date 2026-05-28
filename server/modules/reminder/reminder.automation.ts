import { Injectable, Logger } from '@nestjs/common';
import { Automation, BindTrigger } from '@lark-apaas/fullstack-nestjs-core';
import { ReminderService } from './reminder.service';

@Automation()
@Injectable()
export class ReminderAutomationTasks {
  private readonly logger = new Logger(ReminderAutomationTasks.name);

  constructor(private readonly reminderService: ReminderService) {}

  @BindTrigger('weekly_report_friday_reminder')
  async fridayFirstReminder() {
    this.logger.log('执行周五首次提醒任务');
    
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    
    // TODO: 获取全员 user_id 列表（需要从用户服务或数据库查询）
    const allUserIds: string[] = [];
    
    if (allUserIds.length === 0) {
      this.logger.warn('未配置接收人列表，跳过发送');
      return;
    }
    
    try {
      const result = await this.reminderService.sendReminder({
        reminderType: 'friday_first',
        weekNumber,
        year,
        recipientIds: allUserIds,
        messageTitle: '周报提交提醒',
        messageContent: '周五了，记得提交本周周报哦！截止时间是周日19:00。',
      });
      
      this.logger.log(`周五提醒发送完成：成功 ${result.successCount} 人，失败 ${result.failCount} 人`);
    } catch (error) {
      this.logger.error('周五提醒发送失败:', error);
    }
  }

  @BindTrigger('weekly_report_sunday_reminder')
  async sundaySecondReminder() {
    this.logger.log('执行周日二次提醒任务');
    
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    
    // TODO: 获取未提交周报的 user_id 列表（需要从数据库查询本周已提交人员，然后排除）
    const unsubmittedUserIds: string[] = [];
    
    if (unsubmittedUserIds.length === 0) {
      this.logger.log('无未提交人员，跳过二次提醒');
      return;
    }
    
    try {
      const result = await this.reminderService.sendReminder({
        reminderType: 'sunday_second',
        weekNumber,
        year,
        recipientIds: unsubmittedUserIds,
        messageTitle: '周报即将截止提醒',
        messageContent: '周报截止倒计时！还有5小时，请尽快提交本周周报。',
      });
      
      this.logger.log(`周日提醒发送完成：成功 ${result.successCount} 人，失败 ${result.failCount} 人`);
    } catch (error) {
      this.logger.error('周日提醒发送失败:', error);
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  }
}
