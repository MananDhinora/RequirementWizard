import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, documents, type User, type InsertUser, type Document, type InsertDocument } from "./shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getAllDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = getDb();
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const db = getDb();
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getAllDocuments(): Promise<Document[]> {
    const db = getDb();
    return await db.select().from(documents).orderBy(documents.createdAt);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const db = getDb();
    const [insertedDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return insertedDocument;
  }

  async updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const db = getDb();
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...document,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const db = getDb();
    const [deletedDocument] = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return !!deletedDocument;
  }
}

// Create a singleton instance to be used across the application
export const storage = new DatabaseStorage();