import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Edit, Eye } from "lucide-react";
import { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import TextEditor from "./TextEditor";

export default function DocumentList() {
  const { toast } = useToast();
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Fetch all documents
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/documents"],
    retryOnMount: false,
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/documents/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return apiRequest(`/api/documents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document updated",
        description: "The document has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive">
            Error loading documents. Please try again.
          </p>
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">
            No documents found. Generate a document to get started.
          </p>
        </div>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
  };

  const handleSave = (content: string) => {
    if (editingDocument) {
      updateDocumentMutation.mutate({
        id: editingDocument.id,
        content,
      });
      setEditingDocument(null);
    }
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case "markdown":
        return "bg-blue-500 hover:bg-blue-600";
      case "html":
        return "bg-green-500 hover:bg-green-600";
      case "text":
        return "bg-gray-500 hover:bg-gray-600";
      default:
        return "bg-primary hover:bg-primary/90";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "comprehensive":
        return "bg-purple-500 hover:bg-purple-600";
      case "concise":
        return "bg-amber-500 hover:bg-amber-600";
      case "technical":
        return "bg-red-500 hover:bg-red-600";
      case "business":
        return "bg-emerald-500 hover:bg-emerald-600";
      default:
        return "bg-secondary hover:bg-secondary/90";
    }
  };

  return (
    <div className="space-y-6 mb-10">
      <h2 className="text-2xl font-bold">Your Documents</h2>

      {editingDocument && (
        <TextEditor
          initialContent={editingDocument.content}
          format={editingDocument.format as "markdown" | "html" | "text"}
          title={`Editing: ${editingDocument.title}`}
          onClose={() => setEditingDocument(null)}
          onSave={handleSave}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc: Document) => (
          <Card key={doc.id} className="overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {doc.title}
                </CardTitle>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className={getFormatBadgeColor(doc.format)}
                >
                  {doc.format}
                </Badge>
                <Badge
                  variant="outline"
                  className={getTypeBadgeColor(doc.documentType)}
                >
                  {doc.documentType}
                </Badge>
              </div>
              <CardDescription className="mt-2 text-xs text-muted-foreground">
                Created: {format(new Date(doc.createdAt), "MMM d, yyyy")}
                {doc.updatedAt !== doc.createdAt && (
                  <span>
                    {" "}
                    • Updated: {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4 flex-grow">
              <div className="prose prose-sm max-w-none line-clamp-3 text-muted-foreground">
                {doc.content.substring(0, 150)}...
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(doc)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
