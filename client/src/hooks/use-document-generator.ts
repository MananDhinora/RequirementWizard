import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generatePRD, type GenerateDocumentRequest, type GeneratedDocument } from "@/lib/openai";
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

export function useDocumentGenerator(): UseDocumentGeneratorReturn {
  const [document, setDocument] = useState<GeneratedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: generatePRD,
    onSuccess: (data) => {
      setDocument(data);
      setError(null);
      toast({
        title: "Success!",
        description: "Your PRD document has been generated",
        duration: 3000,
      });
    },
    onError: (err: Error) => {
      setError(err.message || "Failed to generate document. Please check your API key and try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate document",
        duration: 5000,
      });
    },
  });

  const generateDocument = async (params: GenerateDocumentRequest) => {
    try {
      await mutation.mutateAsync(params);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  const resetDocument = () => {
    setDocument(null);
    setError(null);
  };

  const resetError = () => {
    setError(null);
  };

  const updateDocument = (updatedDocument: GeneratedDocument) => {
    setDocument(updatedDocument);
    toast({
      title: "Document updated",
      description: "Your changes have been saved",
      duration: 2000,
    });
  };

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
