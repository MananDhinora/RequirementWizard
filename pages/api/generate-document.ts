import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { storage } from '@/lib/storage';
import { generatePRD } from '@/lib/openai';
import { projectRequirementSchema } from '@/lib/shared/schema';

// API request schema with API key
const generateDocumentSchema = projectRequirementSchema.extend({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().default("gpt-4o")
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate the request body
    const validatedData = generateDocumentSchema.parse(req.body);
    
    // Generate the document using OpenAI
    const generatedDocument = await generatePRD(validatedData);
    
    // Store the document in the database
    const document = await storage.createDocument({
      title: generatedDocument.title,
      content: generatedDocument.content,
      format: generatedDocument.format,
      documentType: validatedData.documentType,
    });
    
    // Return the generated document with its database ID
    return res.status(200).json({
      document,
      content: generatedDocument.content,
    });
  } catch (error) {
    console.error('Error generating document:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data', 
        details: error.errors 
      });
    }
    
    // Handle general errors
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate document' 
    });
  }
}