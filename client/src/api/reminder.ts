import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import { logger } from '@lark-apaas/client-toolkit/logger';

export interface ReminderLogParams {
  weekNumber?: number;
  year?: number;
  type?: 'friday_first' | 'sunday_second';
}

export interface SendReminderData {
  reminderType: 'friday_first' | 'sunday_second';
  weekNumber: number;
  year: number;
  recipientIds: string[];
  messageTitle: string;
  messageContent: string;
}

export async function getReminderLogs(params: ReminderLogParams = {}) {
  try {
    const query = new URLSearchParams();
    if (params.weekNumber !== undefined) query.set('weekNumber', String(params.weekNumber));
    if (params.year !== undefined) query.set('year', String(params.year));
    if (params.type !== undefined) query.set('type', params.type);

    const response = await axiosForBackend({
      url: `/api/reminders/logs?${query.toString()}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取提醒记录失败', error);
    throw error;
  }
}

export async function sendReminder(data: SendReminderData) {
  try {
    const response = await axiosForBackend({
      url: '/api/reminders/send',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('发送提醒失败', error);
    throw error;
  }
}

export async function getReminderStats(weekNumber: number, year: number) {
  try {
    const response = await axiosForBackend({
      url: `/api/reminders/stats?weekNumber=${weekNumber}&year=${year}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取提醒统计失败', error);
    throw error;
  }
}
