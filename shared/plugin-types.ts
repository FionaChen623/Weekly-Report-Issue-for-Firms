// ---- plugin:send_weekly_report_reminder_feishu_message_1 ----
// ============================================================
// 插件 send_weekly_report_reminder_feishu_message_1 (周报系统提醒通知发送) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface SendWeeklyReportReminderFeishuMessageOneInput {
  /** 提醒消息正文内容 */
  reminder_content: string;
  /** 接收通知的用户ID列表 */
  receive_id: string[];
  /** 提醒消息标题 */
  reminder_title: string;
}

/**
 * capabilityClient.load('send_weekly_report_reminder_feishu_message_1').call<SendWeeklyReportReminderFeishuMessageOneOutput>('send_feishu_message', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 */
export interface SendWeeklyReportReminderFeishuMessageOneOutput {
  /** [object Object] */
  success: boolean;
}
// ---- end:send_weekly_report_reminder_feishu_message_1 ----