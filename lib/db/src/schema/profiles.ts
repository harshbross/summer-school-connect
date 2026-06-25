import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  fullName: text("full_name").notNull(),
  pronouns: text("pronouns"),
  homeCity: text("home_city"),
  college: text("college").notNull(),
  year: text("year").notNull(),
  major: text("major").notNull(),
  bio: text("bio").notNull(),
  funFact: text("fun_fact"),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  instagramHandle: text("instagram_handle"),
  websiteUrl: text("website_url"),
  interestTags: text("interest_tags").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({ id: true, updatedAt: true });
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
