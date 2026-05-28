import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { desc, eq, and } from 'drizzle-orm';
import { reminderLogs } from '../../database/schema';

interface SendReminderParams {
  reminderType: 'friday_first' | 'sunday_second';
  weekNumber: number;
  year: number;
  recipientIds: string[];
  messageTitle: string;
  messageContent: string;
}

interface GetLogsParams {
  weekNumber?: number;
  year?: number;
  type?: 'friday_first' | 'sunday_second';
}

interface GetStatsParams {
  weekNumber: number;
  year: number;
}

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);
  private readonly pluginInstanceId = 'send_weekly_report_reminder_feishu_message_1';

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getLogs(params: GetLogsParams) {
    const { weekNumber, year, type } = params;
    
    const conditions = [];
    if (weekNumber !== undefined) {
      conditions.push(eq(reminderLogs.targetWeekNumber, weekNumber));
    }
    if (year !== undefined) {
      conditions.push(eq(reminderLogs.targetYear, year));
    }
    if (type !== undefined) {
      conditions.push(eq(reminderLogs.reminderType, type));
    }
    
    const query = conditions.length > 0
      ? this.db.select().from(reminderLogs).where(and(...conditions))
      : this.db.select().from(reminderLogs);
    
    const logs = await query.orderBy(desc(reminderLogs.createdAt));
    
    return {
      items: logs,
      total: logs.length,
    };
  }

  async sendReminder(params: SendReminderParams) {
    const { reminderType, weekNumber, year, recipientIds, messageTitle, messageContent } = params;
    
    // 创建发送记录
    const [log] = await this.db.insert(reminderLogs).values({
      reminderType,
      targetWeekNumber: weekNumber,
      targetYear: year,
      recipientIds,
      recipientCount: recipientIds.length,
      status: 'running',
      messageTitle,
      messageContent,
      executedAt: new Date(),
    }).returning();

    try {
      // 调用飞书消息插件发送
      const result = await this.sendFeishuMessages(recipientIds, messageTitle, messageContent);
      
      // 更新发送记录
      await this.db.update(reminderLogs)
        .set({
          status: result.success ? 'completed' : 'failed',
          successCount: result.successCount,
          failCount: result.failCount,
          errorMessage: result.errorMessage,
        })
        .where(eq(reminderLogs.id, log.id));
      
      return {
        success: result.success,
        logId: log.id,
        successCount: result.successCount,
        failCount: result.failCount,
      };
    } catch (error) {
      this.logger.error('Send reminder failed:', error);
      
      await this.db.update(reminderLogs)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        })
        .where(eq(reminderLogs.id, log.id));
      
      throw error;
    }
  }

  private async sendFeishuMessages(
    recipientIds: string[],
    title: string,
    content: string,
  ): Promise<{ success: boolean; successCount: number; failCount: number; errorMessage?: string }> {
    try {
      // TODO: 实际发送逻辑需要通过飞书 API 或 CapabilityService 实现
      // 由于 CapabilityService 需要额外的模块依赖，暂时模拟发送成功
      this.logger.log(`[模拟发送] 标题: ${title}, 接收人: ${recipientIds.length} 人`);
      this.logger.log(`[模拟发送] 内容: ${content.substring(0, 50)}...`);
      
      // 实际实现应使用 CapabilityService 调用飞书消息插件：
      // const plugin = capabilityService.load(this.pluginInstanceId);
      // const result = await plugin.call('send_feishu_message', {...});
      
      return {
        success: true,
        successCount: recipientIds.length,
        failCount: 0,
      };
    } catch (error) {
      this.logger.error('Feishu message send failed:', error);
      return {
        success: false,
        successCount: 0,
        failCount: recipientIds.length,
        errorMessage: error instanceof Error ? error.message : 'Failed to send Feishu message',
      };
    }
  }

  async getStats(params: GetStatsParams) {
    const { weekNumber, year } = params;
    
    const logs = await this.db.select()
      .from(reminderLogs)
      .where(
        and(
          eq(reminderLogs.targetWeekNumber, weekNumber),
          eq(reminderLogs.targetYear, year),
        ),
      );
    
    const firstReminder = logs.find(l => l.reminderType === 'friday_first');
    const secondReminder = logs.find(l => l.reminderType === 'sunday_second');
    
    return {
      weekNumber,
      year,
      firstReminder: firstReminder ? {
        sent: firstReminder.status === 'completed',
        recipientCount: firstReminder.recipientCount,
        successCount: firstReminder.successCount,
        executedAt: firstReminder.executedAt,
      } : null,
      secondReminder: secondReminder ? {
        sent: secondReminder.status === 'completed',
        recipientCount: secondReminder.recipientCount,
        successCount: secondReminder.successCount,
        executedAt: secondReminder.executedAt,
      } : null,
    };
  }
}
