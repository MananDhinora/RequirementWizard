import OpenAI from "openai";

// Interfaces
export interface GenerateDocumentRequest {
  apiKey: string;
  model: string;
  projectTitle: string;
  projectDescription: string;
  outputFormat: "markdown" | "text";
  documentType: "comprehensive" | "concise" | "technical" | "business";
}

export interface GeneratedDocument {
  id?: string; // Added ID for DB persistence
  title: string;
  content: string;
  format: "markdown" | "text";
}

function createPromptForDocumentType(
  title: string,
  description: string,
  documentType: string,
  outputFormat: string,
): string {
  const formatInstructions =
    outputFormat === "markdown"
      ? "Use markdown formatting with headers (##, ###), bullet points, and emphasis to structure the document."
      : "Use plain text with clear section headings and spacing to structure the document.";

  const basePrompt = `
Generate a professional Project Requirements Document (PRD) for the following project:

Title: ${title}
Description: ${description}

${formatInstructions}
`;

  const typeSpecificInstructions = {
    comprehensive: `
Create a comprehensive PRD that includes:
1. Executive Summary
2. Project Overview
3. Goals and Objectives
4. Target Audience/Users
5. Project Scope (including what's in and out of scope)
6. Functional Requirements (detailed)
7. Non-Functional Requirements (performance, security, etc.)
8. Technical Requirements and Architecture
9. User Stories or Use Cases
10. Dependencies and Constraints
11. Success Criteria
12. Timeline and Milestones
13. Risks and Mitigation Strategies
14. Approval and Stakeholders
`,
    concise: `
Create a concise PRD that focuses on:
1. Project Overview (brief)
2. Key Goals 
3. Core Requirements (only the most essential)
4. Main Features
5. Basic Timeline
6. Critical Success Factors
`,
    technical: `
Create a technical PRD that emphasizes:
1. System Architecture
2. Technical Requirements (detailed)
3. API Specifications
4. Data Models and Database Structure
5. Security Requirements
6. Performance Requirements
7. Scalability Considerations
8. Development Environment and Tools
9. Testing Strategy
10. Deployment Requirements
`,
    business: `
Create a business-oriented PRD that highlights:
1. Business Case and Value Proposition
2. Market Analysis
3. Target Customer Segments
4. Competitive Positioning
5. Revenue and Monetization Strategy
6. Success Metrics and KPIs
7. Marketing and Launch Plan
8. Customer Acquisition Strategy
9. Budget Considerations
10. Return on Investment Analysis
`,
  };

  return `${basePrompt}${typeSpecificInstructions[documentType as keyof typeof typeSpecificInstructions]}`;
}

// Generate document function - client-side version
export async function generatePRD(
  params: GenerateDocumentRequest,
): Promise<GeneratedDocument> {
  try {
    const response = await fetch("/api/generate-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Error: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();

    if (!result.content) {
      console.log("@/lib line 122");
      throw new Error("Failed to generate document");
    }

    // Handle response that includes document from DB
    if (result.document) {
      return {
        id: result.document.id,
        title: result.document.title || params.projectTitle,
        content: result.content,
        format: result.document.format || params.outputFormat,
      };
    }

    // Fallback to legacy format
    return {
      title: params.projectTitle || "Project Requirements Document",
      content: result.content,
      format: params.outputFormat,
    };
  } catch (error) {
    console.log("@/lib line 143");
    console.error("Error generating document:", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate document",
    );
  }
}

// Server-side OpenAI integration
export async function generatePRDServer(
  params: GenerateDocumentRequest,
): Promise<string> {
  const openai = new OpenAI({ apiKey: params.apiKey });

  try {
    const prompt = createPromptForDocumentType(
      params.projectTitle,
      params.projectDescription,
      params.documentType,
      params.outputFormat,
    );

    const response = await openai.chat.completions.create({
      model: params.model || "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    return content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate document with OpenAI");
  }
}
