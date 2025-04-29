import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/lib/storage';
import { insertDocumentSchema } from '@/lib/shared/schema';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Switch based on HTTP method
  switch (req.method) {
    case 'GET':
      return getDocuments(req, res);
    case 'POST':
      return createDocument(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Return all documents
async function getDocuments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const documents = await storage.getAllDocuments();
    return res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ 
      message: 'Error fetching documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST - Create a new document
async function createDocument(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const validatedData = insertDocumentSchema.parse(req.body);
    
    // Create document in storage
    const document = await storage.createDocument(validatedData);
    
    return res.status(201).json(document);
  } catch (error) {
    console.error('Error creating document:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error creating document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}