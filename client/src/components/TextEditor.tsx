/**
 * TextEditor Component
 * 
 * A full-screen modal text editor with edit and preview modes.
 * Supports markdown and plain text formats with appropriate preview rendering.
 */
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Save, X, Eye, Edit2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface TextEditorProps {
  /** Initial content of the editor */
  initialContent: string;
  /** Format of the content for appropriate preview rendering */
  format: "markdown" | "text";
  /** Title of the document being edited */
  title: string;
  /** Callback when the editor is closed without saving */
  onClose: () => void;
  /** Callback when content is saved */
  onSave: (content: string) => void;
}

export default function TextEditor({
  initialContent,
  format,
  title,
  onClose,
  onSave,
}: TextEditorProps) {
  // Current content state, initialized from props
  const [content, setContent] = useState(initialContent);
  // Toggle between edit and preview modes
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();

  // Update content if initialContent changes (e.g., when editing a different document)
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  /**
   * Save the current content and show confirmation toast
   * Handles errors with appropriate user feedback
   */
  const handleSave = () => {
    try {
      onSave(content);
      toast({
        title: "Document saved",
        description: "Your changes have been saved",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  /**
   * Handle keyboard shortcuts:
   * - Ctrl/Cmd+S: Save
   * - Tab: Insert spaces instead of changing focus
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }

    // Tab key handling - insert spaces instead of changing focus
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  };

  /**
   * Toggle between edit and preview modes
   */
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "edit" ? "preview" : "edit"));
  };

  /**
   * Render content based on format type (markdown or plain text)
   */
  const renderPreview = () => {
    return format === "markdown" ? (
      // For markdown, use ReactMarkdown with typography styling
      <div className="prose prose-sm lg:prose-base max-w-none prose-headings:mt-4 prose-headings:mb-2">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    ) : (
      // For plain text, preserve formatting with pre tag
      <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header with title and action buttons */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Edit: {title}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700"
              onClick={toggleMode}
              aria-label={mode === "edit" ? "Switch to preview mode" : "Switch to edit mode"}
            >
              {mode === "edit" ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700"
              onClick={onClose}
              aria-label="Cancel editing"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              aria-label="Save changes"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Main content area - conditionally shows editor or preview */}
        <div className="flex-grow overflow-auto p-4">
          {mode === "edit" ? (
            // Edit mode - textarea for user input
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-full min-h-[400px] p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none whitespace-pre-wrap"
              spellCheck={false}
              aria-label={`Edit ${title} content`}
            />
          ) : (
            // Preview mode - render formatted content
            <div className="w-full h-full min-h-[400px] p-3 border border-gray-300 rounded-md overflow-auto">
              {renderPreview()}
            </div>
          )}
        </div>

        {/* Footer with format information and keyboard shortcut hints */}
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {mode === "edit"
              ? `Editing in ${format === "markdown" ? "Markdown" : "Plain Text"} format`
              : `Previewing in ${format === "markdown" ? "Markdown" : "Plain Text"} format`}
          </span>
          {mode === "edit" && (
            <span className="text-xs text-gray-500">Press Ctrl+S to save</span>
          )}
        </div>
      </div>
    </div>
  );
}
