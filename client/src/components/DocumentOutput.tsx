import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, AlertCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocumentGenerator } from "@/hooks/use-document-generator";
import TextEditor from "./TextEditor";

export default function DocumentOutput() {
  const { toast } = useToast();
  
  // Get document generator state - only call the hook once
  const documentGenerator = useDocumentGenerator();
  const { document, isGenerating, error, resetError, updateDocument } = documentGenerator;
  
  const [isCopying, setIsCopying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<string | null>(null);
  
  // Automatically open editor when document is generated
  useEffect(() => {
    if (document?.content && !isGenerating && !isEditing) {
      setEditableContent(document.content);
      setIsEditing(true);
    }
  }, [document, isGenerating, isEditing]);

  const handleCopy = async () => {
    if (!document?.content) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(document.content);
      toast({
        title: "Copied!",
        description: "Document copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = () => {
    if (!document?.content) return;

    const filename = document.title
      ? document.title.replace(/\s+/g, "_")
      : "Project_Requirements";

    const extension =
      document.format === "html"
        ? "html"
        : document.format === "markdown"
          ? "md"
          : "txt";

    const blob = new Blob([document.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${filename}.${extension}`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    if (document?.content) {
      setEditableContent(document.content);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (newContent: string) => {
    if (document) {
      updateDocument({
        ...document,
        content: newContent,
      });
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className="mt-5 lg:mt-0 bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 h-full">
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Generated Document
            </h2>

            {document?.content && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleCopy}
                  disabled={isCopying}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  {isCopying ? "Copying..." : "Copy"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {isGenerating && (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-sm">Generating your document...</p>
              <p className="text-xs mt-2">This may take a few moments</p>
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !document?.content && !error && (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm mb-1">
                Your generated document will appear here
              </p>
              <p className="text-xs text-center max-w-sm">
                Fill out the project description and click "Generate PRD" to
                create your document
              </p>
            </div>
          )}

          {/* Error state */}
          {!isGenerating && error && (
            <div className="flex-grow flex flex-col items-center justify-center text-red-500">
              <AlertCircle className="h-16 w-16 mb-4" />
              <p className="text-sm mb-1 font-medium">
                Error generating document
              </p>
              <p className="text-xs text-center max-w-sm">{error}</p>
              <Button
                variant="outline"
                className="mt-4 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={resetError}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Document content */}
          {!isGenerating && document?.content && !error && (
            <div className="flex-grow overflow-auto font-mono text-sm bg-gray-50 p-4 rounded-md">
              <div className="whitespace-pre-wrap">{document.content}</div>
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {isEditing && document && editableContent && (
        <TextEditor
          initialContent={editableContent}
          format={document.format}
          title={document.title}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
