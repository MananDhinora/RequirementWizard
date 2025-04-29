import { NextApiRequest, NextApiResponse } from 'next';
import { generatePRDServer } from '@/lib/openai';
import { storage } from '@/lib/storage';
import { z } from 'zod';

const documentRequestSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().default("gpt-4o"),
  projectTitle: z.string().min(1, "Project title is required"),
  projectDescription: z.string().min(10, "Project description is required"),
  outputFormat: z.enum(["markdown", "html", "text"]).default("markdown"),
  documentType: z.enum(["comprehensive", "concise", "technical", "business"]).default("comprehensive"),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validatedData = documentRequestSchema.parse(req.body);
    
    // Generate document content using OpenAI
    const content = await generatePRDServer(validatedData);
    
    if (!content) {
      return res.status(500).json({ message: 'Failed to generate document content' });
    }
    
    // Save document to database
    try {
      const document = await storage.createDocument({
        title: validatedData.projectTitle,
        content: content,
        format: validatedData.outputFormat,
        documentType: validatedData.documentType,
      });
      
      // Return both content and document metadata
      return res.status(200).json({ 
        content, 
        document
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If db storage fails, still return the content
      return res.status(200).json({ 
        content,
        message: 'Document generated but not saved to database'
      });
    }
  } catch (error) {
    console.error('Error in generate-document API:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    if (error instanceof Error) {
      // Handle OpenAI API errors
      if (error.message.includes('API key')) {
        return res.status(401).json({ message: 'Invalid OpenAI API key' });
      }
      
      return res.status(500).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}