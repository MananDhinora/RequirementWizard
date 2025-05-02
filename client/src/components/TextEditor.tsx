import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Save, X, Eye, Edit2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface TextEditorProps {
  initialContent: string;
  format: "markdown" | "html" | "text";
  title: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export default function TextEditor({
  initialContent,
  format,
  title,
  onClose,
  onSave,
}: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  // Initialize content when component mounts
  useEffect(() => {
    setContent(initialContent);
    if (editorRef.current) {
      editorRef.current.textContent = initialContent;
    }
  }, [initialContent]);

  // Sync editor content when mode changes
  useEffect(() => {
    if (mode === "edit" && editorRef.current) {
      editorRef.current.textContent = content;
    }
  }, [mode]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.textContent || "";
      setContent(newContent);
    }
  };

  const handleSave = () => {
    onSave(content);
    toast({
      title: "Document saved",
      description: "Your changes have been saved",
      duration: 2000,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }

    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "    ");
    }
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "edit" ? "preview" : "edit"));
  };

  const renderPreview = () => {
    switch (format) {
      case "markdown":
        return (
          <div className="prose prose-sm lg:prose-base max-w-none prose-headings:mt-4 prose-headings:mb-2">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        );
      case "html":
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
      default:
        return <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Edit: {title}</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700"
              onClick={toggleMode}
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
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="flex-grow overflow-auto p-4">
          {mode === "edit" ? (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              className="w-full h-full min-h-[400px] p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none whitespace-pre-wrap"
              spellCheck={false}
              suppressContentEditableWarning={true}
            />
          ) : (
            <div className="w-full h-full min-h-[400px] p-3 border border-gray-300 rounded-md overflow-auto">
              {renderPreview()}
            </div>
          )}
        </div>

        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {mode === "edit"
              ? `Editing in ${format === "markdown" ? "Markdown" : format === "html" ? "HTML" : "Plain Text"} format`
              : `Previewing in ${format === "markdown" ? "Markdown" : format === "html" ? "HTML" : "Plain Text"} format`}
          </span>
          {mode === "edit" && (
            <span className="text-xs text-gray-500">Press Ctrl+S to save</span>
          )}
        </div>
      </div>
    </div>
  );
}