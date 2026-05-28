import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { ReminderAutomationTasks } from './reminder.automation';

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, ReminderAutomationTasks],
  exports: [ReminderService],
})
export class ReminderModule {}
