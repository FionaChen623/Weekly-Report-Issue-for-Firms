import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';

interface SendReminderDto {
  reminderType: 'friday_first' | 'sunday_second';
  weekNumber: number;
  year: number;
  recipientIds: string[];
  messageTitle: string;
  messageContent: string;
}

@Controller('api/reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @NeedLogin()
  @Get('logs')
  async getReminderLogs(
    @Query('weekNumber') weekNumber?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ) {
    return this.reminderService.getLogs({
      weekNumber: weekNumber ? parseInt(weekNumber) : undefined,
      year: year ? parseInt(year) : undefined,
      type: type as 'friday_first' | 'sunday_second' | undefined,
    });
  }

  @NeedLogin()
  @Post('send')
  async sendReminder(@Body() dto: SendReminderDto) {
    return this.reminderService.sendReminder(dto);
  }

  @NeedLogin()
  @Get('stats')
  async getReminderStats(
    @Query('weekNumber') weekNumber: string,
    @Query('year') year: string,
  ) {
    return this.reminderService.getStats({
      weekNumber: parseInt(weekNumber),
      year: parseInt(year),
    });
  }
}
