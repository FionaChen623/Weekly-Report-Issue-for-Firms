/* eslint-disable */
/** auto generated, do not edit */
import { pgTable, index, pgPolicy, uuid, varchar, integer, text, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

/** Escape single quotes in SQL string literals */
function escapeLiteral(str: string): string {
  return `'${str.replace(/'/g, "''")}'`;
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number};
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number){
    if(value == null) return value as any;
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    if(typeof value === 'string') {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if(value instanceof Date) return value;
    return new Date(value);
  },
});

export const reminderLogs = pgTable("reminder_logs", {
  id: uuid().defaultRandom().notNull(),
  reminderType: varchar("reminder_type", { length: 50 }).notNull(),
  targetWeekNumber: integer("target_week_number").notNull(),
  targetYear: integer("target_year").notNull(),
  recipientIds: text("recipient_ids").array().default([""]),
  recipientCount: integer("recipient_count").default(0),
  successCount: integer("success_count").default(0),
  failCount: integer("fail_count").default(0),
  status: varchar({ length: 50 }).default('pending'),
  errorMessage: text("error_message"),
  messageTitle: text("message_title"),
  messageContent: text("message_content"),
  executedAt: customTimestamptz('executed_at'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_reminder_logs_executed").using("btree", table.executedAt.asc().nullsLast().op("timestamptz_ops")),
  index("idx_reminder_logs_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
  index("idx_reminder_logs_type").using("btree", table.reminderType.asc().nullsLast().op("text_ops")),
  index("idx_reminder_logs_week").using("btree", table.targetWeekNumber.asc().nullsLast().op("int4_ops"), table.targetYear.asc().nullsLast().op("int4_ops")),
  pgPolicy("修改本人数据_logs", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkcwjsqj6js"], using: sql`(current_setting('app.user_id'::text) = ((_created_by).user_id)::text)` }),
  pgPolicy("查看全部数据_logs", { as: "permissive", for: "select", to: ["anon_workspace_aadkcwjsqj6js", "authenticated_workspace_aadkcwjsqj6js"] }),
  pgPolicy("修改全部数据_logs", { as: "permissive", for: "all", to: ["authenticated_workspace_aadkcwjsqj6js"] }),
  pgPolicy("service_role_bypass_policy_logs", { as: "permissive", for: "all", to: ["service_role_workspace_aadkcwjsqj6js"] }),
]);

// table aliases
export const reminderLogsTable = reminderLogs;
