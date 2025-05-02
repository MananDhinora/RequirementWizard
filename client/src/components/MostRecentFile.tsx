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
import { Trash2, Edit } from "lucide-react";
import { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import TextEditor from "./TextEditor";

type MostRecentDocumentProps = {
  refreshKey: number; // To trigger refresh when document changes
};

export default function MostRecentDocument({
  refreshKey,
}: MostRecentDocumentProps) {
  const { toast } = useToast();
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  // Query for fetching documents based on the refreshKey
  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/documents", refreshKey], // Including refreshKey to trigger refetch
    retryOnMount: false,
  });

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return apiRequest(`/api/documents/${id}`, {
        method: "PATCH",
        body: { content },
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
      console.error("Error updating document:", error);
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
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  if (error || !documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No recent document found.</p>
      </div>
    );
  }

  // Get most recent document based on creation date
  const mostRecent = [...documents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const handleEdit = (doc: Document) => setEditingDocument(doc);
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(id);
    }
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
      <h2 className="text-2xl font-bold">Most Recent Document</h2>

      {editingDocument && (
        <TextEditor
          initialContent={editingDocument.content}
          format={editingDocument.format as "markdown" | "text"}
          title={editingDocument.title}
          onClose={() => setEditingDocument(null)}
          onSave={handleSave}
        />
      )}

      <Card className="overflow-hidden flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {mostRecent.title}
            </CardTitle>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant="secondary"
              className={getFormatBadgeColor(mostRecent.format)}
            >
              {mostRecent.format}
            </Badge>
            <Badge
              variant="outline"
              className={getTypeBadgeColor(mostRecent.documentType)}
            >
              {mostRecent.documentType}
            </Badge>
          </div>
          <CardDescription className="mt-2 text-xs text-muted-foreground">
            Created: {format(new Date(mostRecent.createdAt), "MMM d, yyyy")}
            {mostRecent.updatedAt !== mostRecent.createdAt && (
              <span>
                {" "}
                • Updated:{" "}
                {format(new Date(mostRecent.updatedAt), "MMM d, yyyy")}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="prose prose-sm max-w-none line-clamp-3 text-muted-foreground">
            {mostRecent.content.substring(0, 150)}...
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(mostRecent)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(mostRecent.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
