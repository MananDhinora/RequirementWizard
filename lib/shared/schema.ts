import { pgTable, text, serial, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base user schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Document storage schema
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  format: text("format", { enum: ["markdown", "html", "text"] }).notNull().default("markdown"),
  documentType: text("document_type", { enum: ["comprehensive", "concise", "technical", "business"] }).notNull().default("comprehensive"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Project document schema for document generation
export const projectRequirementSchema = z.object({
  projectTitle: z.string().min(1, "Project title is required"),
  projectDescription: z.string().min(10, "Project description is required"),
  outputFormat: z.enum(["markdown", "html", "text"]).default("markdown"),
  documentType: z.enum(["comprehensive", "concise", "technical", "business"]).default("comprehensive"),
});

export type ProjectRequirement = z.infer<typeof projectRequirementSchema>;

export const generatedDocumentSchema = z.object({
  title: z.string(),
  content: z.string(),
  format: z.enum(["markdown", "html", "text"]),
});

export type GeneratedDocument = z.infer<typeof generatedDocumentSchema>;