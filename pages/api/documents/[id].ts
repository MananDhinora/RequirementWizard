import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/lib/storage';
import { insertDocumentSchema } from '@/lib/shared/schema';
import { z } from 'zod';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid document ID' });
  }
  
  // Switch based on HTTP method
  switch (req.method) {
    case 'GET':
      return getDocument(id, req, res);
    case 'PATCH':
      return updateDocument(id, req, res);
    case 'DELETE':
      return deleteDocument(id, req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// GET - Return a specific document by ID
async function getDocument(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const document = await storage.getDocument(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    return res.status(200).json(document);
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    return res.status(500).json({ 
      message: 'Error fetching document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// PATCH - Update an existing document
async function updateDocument(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    // First check if document exists
    const existingDocument = await storage.getDocument(id);
    
    if (!existingDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Validate the update data (partial validation)
    const updateSchema = insertDocumentSchema.partial();
    const validatedData = updateSchema.parse(req.body);
    
    // Update the document
    const updatedDocument = await storage.updateDocument(id, validatedData);
    
    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ 
      message: 'Error updating document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// DELETE - Remove a document
async function deleteDocument(id: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    // Attempt to delete the document
    const deleted = await storage.deleteDocument(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Document not found or already deleted' });
    }
    
    return res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return res.status(500).json({ 
      message: 'Error deleting document',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}