import OpenAI from "openai";

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

// Generate document function that uses the OpenAI API directly
export async function generatePRD(params: GenerateDocumentRequest): Promise<GeneratedDocument> {
  try {
    // Initialize OpenAI client with the user's API key
    const openai = new OpenAI({ 
      apiKey: params.apiKey || process.env.OPENAI_API_KEY 
    });

    // Determine which model to use
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const model = params.model || "gpt-4o";

    // Create prompt based on document type and project details
    const prompt = createPromptForDocumentType(
      params.documentType,
      params.projectTitle,
      params.projectDescription,
      params.outputFormat
    );

    // Make API call to OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional technical writer who specializes in creating detailed project requirement documents."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    // Extract and format the response
    const content = response.choices[0].message.content || "";
    
    return {
      title: params.projectTitle || "Project Requirements Document",
      content,
      format: params.outputFormat
    };
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate document");
  }
}

// Helper function to create prompts based on document type
function createPromptForDocumentType(
  documentType: string,
  projectTitle: string,
  projectDescription: string,
  outputFormat: string
): string {
  let prompt = `Create a detailed ${documentType} project requirements document for the following project: 
Title: ${projectTitle}
Description: ${projectDescription}\n\n`;

  switch (documentType) {
    case "comprehensive":
      prompt += `Include the following sections:
- Project Overview
- Stakeholders
- Functional Requirements
- Non-Functional Requirements
- User Stories
- Technical Architecture
- Timeline and Milestones
- Success Criteria
- Risks and Mitigations`;
      break;
    case "concise":
      prompt += `Keep it brief and focused on the essential requirements. Include:
- Project Purpose
- Key Requirements
- Success Criteria`;
      break;
    case "technical":
      prompt += `Focus on technical details including:
- System Architecture
- Technical Specifications
- APIs and Integrations
- Performance Requirements
- Security Requirements
- Testing Strategy`;
      break;
    case "business":
      prompt += `Focus on business aspects including:
- Business Goals
- Market Analysis
- Revenue Model
- Key Performance Indicators
- Budget Considerations
- Marketing Strategy`;
      break;
  }

  prompt += `\n\nFormat the output as ${outputFormat}.`;

  return prompt;
}