import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import { insertDocumentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // OpenAI API for generating documents
  app.post("/api/generate-document", async (req, res) => {
    try {
      // Validate request
      const requestSchema = z.object({
        apiKey: z.string().min(1, "API key is required"),
        model: z.string().default("gpt-3.5-turbo"),
        projectTitle: z.string().min(1, "Project title is required"),
        projectDescription: z.string().min(10, "Project description is too short"),
        outputFormat: z.enum(["markdown", "html", "text"]).default("markdown"),
        documentType: z.enum(["comprehensive", "concise", "technical", "business"]).default("comprehensive"),
      });
      
      const validationResult = requestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationResult.error.errors 
        });
      }
      
      const { apiKey, model, projectTitle, projectDescription, outputFormat, documentType } = validationResult.data;
      
      // Initialize OpenAI client with the user's API key
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || apiKey });
      
      // Create the prompt based on document type
      let systemPrompt: string;
      
      switch (documentType) {
        case "concise":
          systemPrompt = "Create a concise project requirements document (PRD) that captures the essential information without unnecessary details. Focus on clarity and brevity while ensuring all critical requirements are included.";
          break;
        case "technical":
          systemPrompt = "Create a technical project requirements document (PRD) that emphasizes system architecture, technical specifications, and implementation details. Include specific technologies, frameworks, and technical constraints.";
          break;
        case "business":
          systemPrompt = "Create a business-focused project requirements document (PRD) that emphasizes business goals, stakeholder benefits, market analysis, and ROI considerations. Focus on business value and strategic alignment.";
          break;
        case "comprehensive":
        default:
          systemPrompt = "Create a comprehensive project requirements document (PRD) that includes project overview, objectives, functional and non-functional requirements, constraints, and success criteria. Make it detailed yet organized and structured.";
          break;
      }
      
      // Format-specific instructions
      let formatInstruction: string;
      
      switch (outputFormat) {
        case "html":
          formatInstruction = "Format the document using HTML with appropriate tags for headings, paragraphs, lists, etc. Do not include HTML, HEAD, or BODY tags.";
          break;
        case "text":
          formatInstruction = "Format the document using plain text with clear section headings and structured content.";
          break;
        case "markdown":
        default:
          formatInstruction = "Format the document using Markdown with appropriate headings, lists, and formatting.";
          break;
      }
      
      // Combine instructions
      const fullSystemPrompt = `${systemPrompt} ${formatInstruction} The document should be well-structured with clear headers and sections.`;
      
      // Make request to OpenAI
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const preferredModel = model === "gpt-4o" ? "gpt-4o" : model;
      
      const response = await openai.chat.completions.create({
        model: preferredModel,
        messages: [
          {
            role: "system",
            content: fullSystemPrompt,
          },
          {
            role: "user",
            content: `Project Title: ${projectTitle}\n\nProject Description: ${projectDescription}\n\nPlease generate a professional project requirements document for this project.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });
      
      // Extract the generated content
      const generatedContent = response.choices[0].message.content;
      
      // Save the document to the database
      try {
        const newDocument = await storage.createDocument({
          title: projectTitle,
          content: generatedContent || "",
          format: outputFormat,
          documentType: documentType,
        });
        
        // Send the response with document ID
        res.json({
          id: newDocument.id,
          content: generatedContent,
        });
      } catch (dbError) {
        console.error("Error saving document to database:", dbError);
        // Still return the content even if DB save fails
        res.json({
          content: generatedContent,
        });
      }
      
    } catch (error) {
      console.error("Error generating document:", error);
      
      // Check for OpenAI API-specific errors
      if (error.response?.status === 401) {
        return res.status(401).json({ message: "Invalid OpenAI API key" });
      } else if (error.response?.status === 429) {
        return res.status(429).json({ message: "Rate limit exceeded or insufficient quota for OpenAI API" });
      }
      
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Document management API routes
  // Get all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Get a single document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error retrieving document:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Update a document
  app.patch("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateSchema = insertDocumentSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation error",
          errors: validationResult.error.errors
        });
      }
      
      const updatedDocument = await storage.updateDocument(id, validationResult.data);
      
      if (!updatedDocument) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  // Delete a document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
