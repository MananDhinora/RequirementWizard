import { useState, useRef, useCallback } from "react";
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

  // Initialize once
  if (!initialized.current) {
    initialized.current = true;
  }

  const mutation = useMutation({
    mutationFn: generatePRD,
    onSuccess: (data) => {
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
    try {
      await mutation.mutateAsync(params);
    } catch (err) {
      // Error is handled by the mutation
    }
  }, [mutation]);

  const resetDocument = useCallback(() => {
    documentCache = null;
    setDocument(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const updateDocument = useCallback((updatedDocument: GeneratedDocument) => {
    // Update both state and cache
    documentCache = updatedDocument;
    setDocument(updatedDocument);
    toast({
      title: "Document updated",
      description: "Your changes have been saved",
      duration: 2000,
    });
  }, [toast]);

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
