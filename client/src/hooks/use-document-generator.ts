import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generatePRD,
  type GenerateDocumentRequest,
  type GeneratedDocument,
} from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";

interface UseDocumentGeneratorReturn {
  document: GeneratedDocument | null;
  isGenerating: boolean;
  error: string | null;
  generateDocument: (params: GenerateDocumentRequest) => Promise<void>;
  resetDocument: () => void;
  resetError: () => void;
  updateDocument: (updatedDocument: GeneratedDocument) => void;
}

// Store the document in memory to persist between component renders
let documentCache: GeneratedDocument | null = null;

export function useDocumentGenerator(): UseDocumentGeneratorReturn {
  // Use the cached document as initial state
  const [document, setDocument] = useState<GeneratedDocument | null>(documentCache);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Use a ref to track if this is a new instance of the hook
  const initialized = useRef(false);
  const hookId = useRef(Math.random().toString(36).substring(7));

  // Initialize once
  if (!initialized.current) {
    initialized.current = true;
    console.log(`[${hookId.current}] useDocumentGenerator initialized, cache:`, documentCache);
  }

  // Debug: Log when document changes
  useEffect(() => {
    console.log(`[${hookId.current}] Document state changed:`, document);
  }, [document]);

  const mutation = useMutation({
    mutationFn: generatePRD,
    onSuccess: (data) => {
      console.log(`[${hookId.current}] Generation successful, received:`, data);
      
      // Update both state and cache
      documentCache = data;
      setDocument(data);
      setError(null);
      
      toast({
        title: "Success!",
        description: "Your PRD document has been generated",
        duration: 3000,
      });
    },
    onError: (err: Error) => {
      console.error(`[${hookId.current}] Generation error:`, err);
      
      setError(
        err.message ||
          "Failed to generate document. Please check your API key and try again.",
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate document",
        duration: 5000,
      });
    },
  });

  const generateDocument = useCallback(async (params: GenerateDocumentRequest) => {
    console.log(`[${hookId.current}] Generating document with params:`, params);
    
    try {
      const result = await mutation.mutateAsync(params);
      console.log(`[${hookId.current}] Generated document result:`, result);
      // We don't return anything to match the Promise<void> type
    } catch (err) {
      console.error(`[${hookId.current}] Error caught in generateDocument:`, err);
      // Error is handled by the mutation
    }
  }, [mutation, hookId]);

  const resetDocument = useCallback(() => {
    console.log(`[${hookId.current}] Resetting document`);
    documentCache = null;
    setDocument(null);
    setError(null);
  }, [hookId]);

  const resetError = useCallback(() => {
    console.log(`[${hookId.current}] Resetting error`);
    setError(null);
  }, [hookId]);

  const updateDocument = useCallback((updatedDocument: GeneratedDocument) => {
    console.log(`[${hookId.current}] Updating document:`, updatedDocument);
    
    // Update both state and cache
    documentCache = updatedDocument;
    setDocument(updatedDocument);
    
    toast({
      title: "Document updated",
      description: "Your changes have been saved",
      duration: 2000,
    });
  }, [toast, hookId]);

  return {
    document,
    isGenerating: mutation.isPending,
    error,
    generateDocument,
    resetDocument,
    resetError,
    updateDocument,
  };
}
