import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Key, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyFormProps {
  onApiKeyConnected: () => void;
  apiKeyConnected: boolean;
}

export default function ApiKeyForm({
  onApiKeyConnected,
  apiKeyConnected,
}: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isConnected, setIsConnected] = useState(apiKeyConnected);
  const { toast } = useToast();

  // Check if API key is stored in environment variable
  useEffect(() => {
    const checkEnvApiKey = async () => {
      try {
        if (process.env.OPENAI_API_KEY) {
          setIsConnected(true);
          onApiKeyConnected();
        }
      } catch (error) {
        console.error("Error checking API key:", error);
      }
    };

    checkEnvApiKey();
  }, [onApiKeyConnected]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter an OpenAI API key to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);

    try {
      // Simulate API key validation
      // In a real app, we would make a test request to OpenAI API
      // Here we're just checking if it looks like a valid key format
      if (apiKey.startsWith("sk-") && apiKey.length > 30) {
        // Save API key to session storage
        sessionStorage.setItem("openai_api_key", apiKey);
        
        setIsConnected(true);
        onApiKeyConnected();
        
        toast({
          title: "API Key Connected",
          description: "Your OpenAI API key has been successfully connected.",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "The API key format is invalid. It should start with 'sk-' and be longer.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect your API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem("openai_api_key");
    setApiKey("");
    setIsConnected(false);
    
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed from this session.",
    });
  };

  if (isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle2 className="text-green-500 h-5 w-5 mr-2" />
          <span className="text-green-800 font-medium">
            API Key connected and ready to use
          </span>
        </div>
        <Button onClick={handleReset} variant="outline" size="sm">
          Reset API Key
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center mb-3">
        <Key className="text-blue-500 h-5 w-5 mr-2" />
        <h3 className="text-blue-800 font-medium">Connect OpenAI API Key</h3>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="password"
          placeholder="Enter your OpenAI API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-grow"
        />
        <Button 
          onClick={handleConnect} 
          disabled={isChecking || !apiKey.trim()}
        >
          {isChecking ? "Connecting..." : "Connect"}
        </Button>
      </div>
      
      <div className="mt-3 flex items-start">
        <AlertTriangle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-gray-600">
          Your API key is stored only in your browser session and never sent to our servers.
          You will be charged by OpenAI for any API usage.
        </p>
      </div>
    </div>
  );
}