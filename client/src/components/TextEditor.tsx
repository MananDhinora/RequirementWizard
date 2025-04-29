import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextEditorProps {
  initialContent: string;
  format: "markdown" | "html" | "text";
  title: string;
  onClose: () => void;
  onSave: (content: string) => void;
}

export default function TextEditor({ initialContent, format, title, onClose, onSave }: TextEditorProps) {
  const [content, setContent] = useState(initialContent);
  const { toast } = useToast();

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 400)}px`;
    }
  }, [content]);

  const handleSave = () => {
    onSave(content);
    toast({
      title: "Document saved",
      description: "Your changes have been saved",
      duration: 2000,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Edit: {title}
          </h2>
          <div className="flex space-x-2">
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
              className="bg-primary-600 hover:bg-primary-700 text-white"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
        
        <div className="flex-grow overflow-auto p-4">
          <textarea
            id="editor-textarea"
            className="w-full h-full min-h-[400px] p-3 font-mono text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck="false"
          />
        </div>
        
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500">
          Editing in {format === "markdown" ? "Markdown" : format === "html" ? "HTML" : "Plain Text"} format
        </div>
      </div>
    </div>
  );
}