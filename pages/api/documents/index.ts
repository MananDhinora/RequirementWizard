import { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '@/lib/storage';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle GET method (get all documents)
  if (req.method === 'GET') {
    try {
      const documents = await storage.getAllDocuments();
      return res.status(200).json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch documents' 
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}