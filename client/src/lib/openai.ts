import { apiRequest } from "./queryClient";

// Interfaces
export interface GenerateDocumentRequest {
  apiKey: string;
  model: string;
  projectTitle: string;
  projectDescription: string;
  outputFormat: "markdown" | "html" | "text";
  documentType: "comprehensive" | "concise" | "technical" | "business";
}

export interface GeneratedDocument {
  id?: string;  // Added ID for DB persistence
  title: string;
  content: string;
  format: "markdown" | "html" | "text";
}

// Generate document function
export async function generatePRD(params: GenerateDocumentRequest): Promise<GeneratedDocument> {
  try {
    const response = await apiRequest(
      "/api/generate-document",
      {
        method: "POST",
        body: JSON.stringify(params)
      }
    );
    
    const result = await response.json();
    
    if (!result.content) {
      throw new Error("Failed to generate document");
    }
    
    // Handle response that includes document from DB
    if (result.document) {
      return {
        id: result.document.id,
        title: result.document.title || params.projectTitle,
        content: result.content,
        format: result.document.format || params.outputFormat
      };
    }
    
    // Fallback to legacy format
    return {
      title: params.projectTitle || "Project Requirements Document",
      content: result.content,
      format: params.outputFormat
    };
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate document");
  }
}
