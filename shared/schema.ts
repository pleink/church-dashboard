import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  imageUrl: text("image_url"),
  location: text("location"),
});

export const roomBookings = pgTable("room_bookings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  resourceName: text("resource_name").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
});

export const birthdays = pgTable("birthdays", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  avatarUrl: text("avatar_url"),
});

export const verseOfWeek = pgTable("verse_of_week", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  reference: text("reference").notNull(),
  weekStart: timestamp("week_start").notNull(),
});

export const flyers = pgTable("flyers", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertRoomBookingSchema = createInsertSchema(roomBookings).omit({
  id: true,
});

export const insertBirthdaySchema = createInsertSchema(birthdays).omit({
  id: true,
});

export const insertVerseSchema = createInsertSchema(verseOfWeek).omit({
  id: true,
});

export const insertFlyerSchema = createInsertSchema(flyers).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type RoomBooking = typeof roomBookings.$inferSelect;
export type Birthday = typeof birthdays.$inferSelect;
export type VerseOfWeek = typeof verseOfWeek.$inferSelect;
export type Flyer = typeof flyers.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertRoomBooking = z.infer<typeof insertRoomBookingSchema>;
export type InsertBirthday = z.infer<typeof insertBirthdaySchema>;
export type InsertVerseOfWeek = z.infer<typeof insertVerseSchema>;
export type InsertFlyer = z.infer<typeof insertFlyerSchema>;
