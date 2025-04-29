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
  title: string;
  content: string;
  format: "markdown" | "html" | "text";
}

// Generate document function
export async function generatePRD(params: GenerateDocumentRequest): Promise<GeneratedDocument> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/generate-document",
      params
    );
    
    const result = await response.json();
    
    if (!result.content) {
      throw new Error("Failed to generate document");
    }
    
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
