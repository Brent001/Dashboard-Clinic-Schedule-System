import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
  username: text('username').notNull(),
  password: text('password').notNull(),
  role: text('role').default('user').notNull(), // Role column
  status: text('status').default('enable').notNull() // Renamed from "disabled" to "status"
});

export const schedules = sqliteTable('schedules', {
  id: text('id').primaryKey(), // Unique identifier for each schedule
  purpose: text('purpose').notNull(), // Purpose of the schedule (e.g., Dental Checkup)
  date: text('date').notNull(), // Date of the schedule
  time: text('time').notNull(), // Time of the schedule
  message: text('message').notNull() // Additional details or message
});

// Add the logs table
export const logs = sqliteTable('logs', {
  id: integer('id').primaryKey(), // Primary key (auto-incrementing by default in SQLite)
  username: text('username').notNull(), // Username of the user who logged in
  ip: text('ip').notNull(), // IP address of the user
  time: text('time').notNull(), // Login time (ISO string)
  os: text('os'), // Operating system of the user
  browser: text('browser') // Browser used by the user
});
