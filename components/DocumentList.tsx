import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash, FileText, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@/shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from 'react-markdown';

export default function DocumentList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editContent, setEditContent] = useState<Record<string, string>>({});
  
  // Fetch all documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/documents'],
    refetchInterval: 5000, // Poll every 5 seconds to catch newly created documents
  });
  
  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
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
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
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
          <p className="text-destructive">Error loading documents. Please try again.</p>
        </div>
      </div>
    );
  }
  
  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No documents found. Generate a document to get started.</p>
        </div>
      </div>
    );
  }
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteDocumentMutation.mutate(id);
    }
  };
  
  const toggleEditMode = (doc: Document) => {
    const newEditMode = { ...editMode };
    const docId = doc.id;
    newEditMode[docId] = !newEditMode[docId];
    setEditMode(newEditMode);
    
    // Initialize edit content if entering edit mode
    if (!newEditMode[docId]) {
      // We're exiting edit mode, reset the local edit content
      const newEditContent = { ...editContent };
      delete newEditContent[docId];
      setEditContent(newEditContent);
    } else {
      // We're entering edit mode, initialize with current content
      const newEditContent = { ...editContent };
      newEditContent[docId] = doc.content;
      setEditContent(newEditContent);
    }
  };
  
  const handleContentChange = (docId: string, newContent: string) => {
    const newEditContent = { ...editContent };
    newEditContent[docId] = newContent;
    setEditContent(newEditContent);
  };
  
  const handleSave = (docId: string) => {
    const content = editContent[docId];
    if (content) {
      updateDocumentMutation.mutate({ id: docId, content });
      
      // Exit edit mode after saving
      const newEditMode = { ...editMode };
      newEditMode[docId] = false;
      setEditMode(newEditMode);
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
      
      <div className="grid grid-cols-1 gap-6">
        {documents.map((doc: Document) => (
          <Card key={doc.id} className="overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold">{doc.title}</CardTitle>
                <div className="flex space-x-2">
                  <Badge className={getFormatBadgeColor(doc.format)}>
                    {doc.format}
                  </Badge>
                  <Badge className={getTypeBadgeColor(doc.documentType)}>
                    {doc.documentType}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="flex items-center justify-end mb-4">
                <Label htmlFor={`toggle-edit-${doc.id}`} className="mr-2">
                  {editMode[doc.id] ? "Edit Mode" : "View Mode"}
                </Label>
                <Switch 
                  id={`toggle-edit-${doc.id}`}
                  checked={editMode[doc.id] || false}
                  onCheckedChange={() => toggleEditMode(doc)}
                />
              </div>
              
              {editMode[doc.id] ? (
                <div className="relative h-full">
                  <textarea
                    className="w-full h-80 p-3 border rounded-md font-mono text-sm resize-none"
                    value={editContent[doc.id] || doc.content}
                    onChange={(e) => handleContentChange(doc.id, e.target.value)}
                  />
                  <Button 
                    className="absolute bottom-4 right-4" 
                    size="sm"
                    onClick={() => handleSave(doc.id)}
                    disabled={updateDocumentMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto p-4 border rounded-md bg-gray-50">
                  {doc.format === "markdown" && (
                    <div className="markdown-content">
                      <ReactMarkdown>{doc.content}</ReactMarkdown>
                    </div>
                  )}
                  {doc.format === "html" && (
                    <div 
                      className="html-content"
                      dangerouslySetInnerHTML={{ __html: doc.content }}
                    />
                  )}
                  {doc.format === "text" && (
                    <pre className="whitespace-pre-wrap font-mono text-sm">{doc.content}</pre>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between border-t p-4 bg-gray-50">
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleteDocumentMutation.isPending}
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleEditMode(doc)}
                >
                  {editMode[doc.id] ? (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}