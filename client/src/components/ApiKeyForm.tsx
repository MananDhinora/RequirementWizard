import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().default("gpt-3.5-turbo"),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface ApiKeyFormProps {
  onApiKeyConnected: () => void;
  apiKeyConnected: boolean;
}

export default function ApiKeyForm({
  onApiKeyConnected,
  apiKeyConnected,
}: ApiKeyFormProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: "",
      model: "gpt-3.5-turbo",
    },
  });

  useEffect(() => {
    // Check if API key is in session storage on component mount
    const storedApiKey = sessionStorage.getItem("openai_api_key");
    const storedModel = sessionStorage.getItem("openai_model");

    if (storedApiKey) {
      form.setValue("apiKey", storedApiKey);

      if (storedModel) {
        form.setValue("model", storedModel);
      }

      onApiKeyConnected();
    }
  }, [form, onApiKeyConnected]);

  const onSubmit = (data: ApiKeyFormValues) => {
    // Store in session storage for security (not localStorage)
    sessionStorage.setItem("openai_api_key", data.apiKey);
    sessionStorage.setItem("openai_model", data.model);

    toast({
      title: "Settings saved",
      description: "Your API key has been saved securely",
      duration: 3000,
    });

    onApiKeyConnected();
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          OpenAI API Settings
        </h2>
        {apiKeyConnected && (
          <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Connected
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  API Key
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      {...field}
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter your OpenAI API key"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center bg-white border text-gray-400 hover:text-gray-600"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Your API key is stored locally in your browser and never sent
                  to our servers.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  AI Model
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gpt-4o">
                      GPT-4o (Most capable)
                    </SelectItem>
                    <SelectItem value="gpt-4">
                      GPT-4 (Advanced capabilities)
                    </SelectItem>
                    <SelectItem value="gpt-3.5-turbo">
                      GPT-3.5 Turbo (Fast & economical)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : apiKeyConnected ? (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Update Settings
                </span>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
