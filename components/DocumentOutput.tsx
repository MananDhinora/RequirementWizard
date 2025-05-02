import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, Download, AlertCircle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

export default function DocumentOutput() {
  const [document, setDocument] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log("DocumentOutput rendering - document:", document);

  // Listen for document changes from the project form
  useEffect(() => {
    function handleDocumentGenerated(event) {
      if (event.detail) {
        const newDocument = event.detail;
        setDocument(newDocument);
        setIsGenerating(false);
        setError(null);

        // Invalidate the documents query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      }
    }

    function handleGenerationStart() {
      setIsGenerating(true);
      setError(null);
    }

    function handleGenerationError(event) {
      setIsGenerating(false);
      setError(event.detail);
    }

    window.addEventListener("document-generated", handleDocumentGenerated);
    window.addEventListener("generation-start", handleGenerationStart);
    window.addEventListener("generation-error", handleGenerationError);

    return () => {
      window.removeEventListener("document-generated", handleDocumentGenerated);
      window.removeEventListener("generation-start", handleGenerationStart);
      window.removeEventListener("generation-error", handleGenerationError);
    };
  }, [queryClient]);

  const handleCopy = async () => {
    if (!document?.content) return;

    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(document.content);
      toast({
        title: "Copied!",
        description: "Document content has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownload = () => {
    if (!document?.content) return;

    const filename = `${document.title || "document"}.${document.format === "markdown" ? "md" : document.format === "html" ? "html" : "txt"}`;
    const blob = new Blob([document.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `Document has been downloaded as ${filename}.`,
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Generated helllloDocument</CardTitle>
      </CardHeader>

      <CardContent className="flex-grow relative overflow-auto pb-2">
        {/* Loading state */}
        {isGenerating && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-center font-medium">
              Generating your document...
            </p>
            <p className="text-center text-sm mt-2">
              This may take a moment, please wait.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isGenerating && (
          <div className="flex-grow flex flex-col items-center justify-center text-destructive py-8">
            <AlertCircle className="h-12 w-12 mb-4" />
            <p className="text-center font-medium">Error generating document</p>
            <p className="text-center text-sm mt-2">{error}</p>
            <Button
              onClick={() => setError(null)}
              className="mt-4"
              variant="outline"
              size="sm"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && !document?.content && !error && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 py-8">
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
              Your generated document will appear here hello
            </p>
            <p className="text-xs text-center max-w-sm">
              Fill out the project description and click "Generate PRD" to
              create your document
            </p>
          </div>
        )}

        {/* Document content */}
        {!isGenerating && document?.content && (
          <div className="relative">
            <div className="px-1 py-2 max-h-[500px] overflow-y-auto">
              {document.format === "markdown" && (
                <div className="markdown-content">
                  <ReactMarkdown>{document.content}</ReactMarkdown>
                </div>
              )}

              {document.format === "html" && (
                <div
                  className="html-content"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              )}

              {document.format === "text" && (
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {document.content}
                </pre>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {!isGenerating && document?.content && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex space-x-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              disabled={isCopying}
            >
              <Copy className="h-4 w-4 mr-2" />
              {isCopying ? "Copying..." : "Copy"}
            </Button>

            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div>
            <Button
              onClick={() => {
                // Switch to the "Your Documents" tab to view the saved document
                const tabEvent = new CustomEvent("switch-tab", {
                  detail: "list",
                });
                window.dispatchEvent(tabEvent);
              }}
              variant="default"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              View in Documents
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
