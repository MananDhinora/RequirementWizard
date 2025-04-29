import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { storage } from '@/lib/storage';
import { insertDocumentSchema } from '@/lib/shared/schema';

// Schema for updating documents
const updateDocumentSchema = insertDocumentSchema.partial();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get document ID from the request
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid document ID' });
  }

  // Handle GET method (get document by ID)
  if (req.method === 'GET') {
    try {
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.status(200).json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch document' 
      });
    }
  }
  
  // Handle PATCH method (update document)
  if (req.method === 'PATCH') {
    try {
      // Validate the request body
      const validatedData = updateDocumentSchema.parse(req.body);
      
      // Update the document
      const updatedDocument = await storage.updateDocument(id, validatedData);
      
      if (!updatedDocument) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.status(200).json(updatedDocument);
    } catch (error) {
      console.error('Error updating document:', error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid request data', 
          details: error.errors 
        });
      }
      
      // Handle general errors
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update document' 
      });
    }
  }
  
  // Handle DELETE method
  if (req.method === 'DELETE') {
    try {
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Document not found' });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete document' 
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}